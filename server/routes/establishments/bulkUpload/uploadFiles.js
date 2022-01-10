'use strict';
const csv = require('csvtojson');

const config = require('../../../config/config');
const EstablishmentCsvValidator = require('../../../models/BulkImport/csv/establishments').Establishment;
const TrainingCsvValidator = require('../../../models/BulkImport/csv/training').Training;
const S3 = require('./s3');
const { buStates } = require('./states');
const Bucket = S3.Bucket;
const validatorFactory = require('../../../models/BulkImport/csv/validatorFactory').validatorFactory;
const { isWorkerFile } = require('./whichFile');

const createMyFileObject = (myfile, type) => {
  return {
    data: myfile.data,
    type: type,
    metaData: {
      filename: myfile.filename,
      fileType: type,
      userName: myfile.username,
      size: myfile.size,
      key: myfile.key,
      lastModified: myfile.lastModified,
      records: null,
    },
  };
};
const updateMetaData = async (file, username, establishmentId) => {
  const firstRow = 0;
  const firstLineNumber = 1;

  const validator = validatorFactory(file.type, file.importedData[firstRow], firstLineNumber);
  const passedCheck = validator.preValidate(file.header);

  if (!passedCheck) {
    file.metaData.fileType = null;
  } else {
    file.metaData.records = file.importedData.length;
  }

  // count records and update metadata
  S3.uploadJSONDataToS3(username, establishmentId, file.metaData, `latest/${file.metaData.filename}.metadata`);
};

const uploadedGet = async (req, res) => {
  try {
    const ignoreMetaDataObjects = /.*metadata.json$/;
    const ignoreRoot = /.*\/$/;

    const data = await S3.s3
      .listObjects({
        Bucket,
        Prefix: `${req.establishmentId}/latest/`,
      })
      .promise();

    const returnData = await Promise.all(
      data.Contents.filter((myFile) => !ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)).map(
        async (file) => {
          const elements = file.Key.split('/');

          const objData = await S3.s3
            .headObject({
              Bucket,
              Key: file.Key,
            })
            .promise();

          const username = objData && objData.Metadata ? objData.Metadata.username : '';

          const fileMetaData = data.Contents.filter((myFile) => myFile.Key === file.Key + '.metadata.json');

          let metadataJSON = {};

          if (fileMetaData.length === 1) {
            const metaData = await S3.downloadContent(fileMetaData[0].Key);
            metadataJSON = JSON.parse(metaData.data);
          }

          return {
            filename: elements[elements.length - 1],
            uploaded: file.LastModified,
            username,
            records: metadataJSON.records ? metadataJSON.records : 0,
            errors: metadataJSON.errors ? metadataJSON.errors : 0,
            warnings: metadataJSON.warnings ? metadataJSON.warnings : 0,
            fileType: metadataJSON.fileType ? metadataJSON.fileType : null,
            size: file.Size,
            key: encodeURI(file.Key),
          };
        },
      ),
    );
    await S3.saveResponse(req, res, 200, {
      establishment: {
        uid: req.establishmentId,
      },
      files: returnData,
    });
  } catch (err) {
    console.error(err);

    await S3.saveResponse(req, res, 500, {});
  }
};
const uploadedPost = async (req, res) => {
  const establishmentId = String(req.establishmentId);
  const username = req.username;
  const uploadedFiles = req.body.files;

  if (!uploadedFiles || !Array.isArray(uploadedFiles)) {
    await S3.saveResponse(req, res, 400, {});
    return;
  }

  try {
    // clean up existing bulk upload objects

    //await purgeBulkUploadS3Objects(establishmentId);

    const signedUrls = [];

    uploadedFiles.forEach((thisFile) => {
      if (thisFile.filename) {
        thisFile.signedUrl = S3.s3.getSignedUrl('putObject', {
          Bucket,
          Key: `${establishmentId}/latest/${thisFile.filename}`,
          ContentType: req.query.type,
          Metadata: {
            username,
            establishmentId,
            validationstatus: 'pending',
          },
          Expires: config.get('bulkupload.uploadSignedUrlExpire'),
        });
        signedUrls.push(thisFile);
      }
    });

    await S3.saveResponse(req, res, 200, signedUrls);
  } catch (err) {
    console.error('API POST bulkupload/uploaded: ', err);
    await S3.saveResponse(req, res, 500, {});
  }
};
const uploadedPut = async (req, res) => {
  const establishmentId = req.establishmentId;
  const username = req.username;
  const myDownloads = [];
  const returnData = [];

  try {
    // awaits must be within a try/catch block - checking if file exists - saves having to repeatedly download from S3 bucket
    const createModelPromises = [];

    const data = await S3.s3
      .listObjects({
        Bucket,
        Prefix: `${req.establishmentId}/latest/`,
      })
      .promise();
    data.Contents.forEach((myFile) => {
      const ignoreMetaDataObjects = /.*metadata.json$/;
      const ignoreRoot = /.*\/$/;

      if (!ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)) {
        createModelPromises.push(S3.downloadContent(myFile.Key, myFile.Size, myFile.LastModified));
      }
    });

    const allContent = await Promise.all(createModelPromises);

    allContent.forEach((myfile) => {
      if (EstablishmentCsvValidator.isContent(myfile.data)) {
        myDownloads.push(createMyFileObject(myfile, 'Establishment'));
      } else if (isWorkerFile(myfile.data)) {
        myDownloads.push(createMyFileObject(myfile, 'Worker'));
      } else if (TrainingCsvValidator.isContent(myfile.data)) {
        myDownloads.push(createMyFileObject(myfile, 'Training'));
      } else {
        myDownloads.push(createMyFileObject(myfile, null));
      }
    });

    await Promise.all(
      myDownloads
        .filter((file) => {
          return ['Worker', 'Establishment', 'Training'].includes(file.type);
        })
        .map(async (file) => {
          file.importedData = await csv().fromString(file.data);
          const lastPos = file.data.indexOf('\n') > -1 ? file.data.indexOf('\n') : file.data.length;
          file.header = file.data.substring(0, lastPos).trim();

          await updateMetaData(file, username, establishmentId);
        }),
    );

    myDownloads.forEach((file) => {
      const { key, filename, fileType, size, lastModified: uploaded, userName: username, records } = file.metaData;

      returnData.push({
        key,
        filename,
        fileType,
        size,
        uploaded,
        username,
        records,
        errors: 0,
        warnings: 0,
      });
    });
    await S3.saveResponse(req, res, 200, returnData);
  } catch (err) {
    console.error(err);
    await S3.saveResponse(req, res, 500, {});
  }
};
const uploadedStarGet = async (req, res) => {
  const Key = req.params['0'];
  const elements = Key.split('/');

  try {
    const objHeadData = await S3.s3
      .headObject({
        Bucket,
        Key,
      })
      .promise();

    await S3.saveResponse(req, res, 200, {
      file: {
        filename: elements[elements.length - 1],
        uploaded: objHeadData.LastModified,
        username: objHeadData.Metadata.username,
        size: objHeadData.ContentLength,
        key: Key,
        signedUrl: S3.s3.getSignedUrl('getObject', {
          Bucket,
          Key,
          Expires: config.get('bulkupload.uploadSignedUrlExpire'),
        }),
      },
    });
  } catch (err) {
    if (err.code && err.code === 'NotFound') {
      await S3.saveResponse(req, res, 404, {});
    } else {
      console.error(err);
      await S3.saveResponse(req, res, 500, {});
    }
  }
};

const { acquireLock } = require('./lock');
const router = require('express').Router();

router.route('/').get(acquireLock.bind(null, uploadedGet, buStates.DOWNLOADING, true));
router.route('/').post(acquireLock.bind(null, uploadedPost, buStates.UPLOADING, true));
router.route('/').put(acquireLock.bind(null, uploadedPut, buStates.UPLOADING, true));
router.route('/*').get(acquireLock.bind(null, uploadedStarGet, buStates.DOWNLOADING, true));

module.exports = router;
module.exports.uploadedPut = uploadedPut;
