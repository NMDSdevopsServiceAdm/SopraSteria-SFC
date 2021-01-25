'use strict';
const csv = require('csvtojson');
const config = require('../../../config/config');
const EstablishmentCsvValidator = require('../../../models/BulkImport/csv/establishments').Establishment;
const WorkerCsvValidator = require('../../../models/BulkImport/csv/workers').Worker;
const TrainingCsvValidator = require('../../../models/BulkImport/csv/training').Training;
const { s3, Bucket, saveResponse, uploadAsJSON, downloadContent } = require('./s3');
const { buStates } = require('./states');

const uploadedGet = async (req, res) => {
  try {
    const ignoreMetaDataObjects = /.*metadata.json$/;
    const ignoreRoot = /.*\/$/;

    const data = await s3
      .listObjects({
        Bucket,
        Prefix: `${req.establishmentId}/latest/`,
      })
      .promise();

    const returnData = await Promise.all(
      data.Contents.filter((myFile) => !ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)).map(
        async (file) => {
          const elements = file.Key.split('/');

          const objData = await s3
            .headObject({
              Bucket,
              Key: file.Key,
            })
            .promise();

          const username = objData && objData.Metadata ? objData.Metadata.username : '';

          const fileMetaData = data.Contents.filter((myFile) => myFile.Key === file.Key + '.metadata.json');

          let metadataJSON = {};

          if (fileMetaData.length === 1) {
            const metaData = await downloadContent(fileMetaData[0].Key);
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

    await saveResponse(req, res, 200, {
      establishment: {
        uid: req.establishmentId,
      },
      files: returnData,
    });
  } catch (err) {
    console.error(err);

    await saveResponse(req, res, 503, {});
  }
};

const uploadedPost = async (req, res) => {
  const establishmentId = String(req.establishmentId);
  const username = req.username;
  const uploadedFiles = req.body.files;

  if (!uploadedFiles || !Array.isArray(uploadedFiles)) {
    await saveResponse(req, res, 400, {});
    return;
  }

  try {
    // clean up existing bulk upload objects

    //await purgeBulkUploadS3Objects(establishmentId);

    const signedUrls = [];

    uploadedFiles.forEach((thisFile) => {
      if (thisFile.filename) {
        thisFile.signedUrl = s3.getSignedUrl('putObject', {
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

    await saveResponse(req, res, 200, signedUrls);
  } catch (err) {
    console.error('API POST bulkupload/uploaded: ', err);
    await saveResponse(req, res, 503, {});
  }
};

const updateMetaData = async (file, username, establishmentId) => {
  const firstRow = 0;
  const firstLineNumber = 1;
  let passedCheck = false;
  switch (file.type) {
    case 'Establishment':
      passedCheck = new EstablishmentCsvValidator(file.importedData[firstRow], firstLineNumber).preValidate(
        file.header,
      );
      break;
    case 'Worker':
      passedCheck = new WorkerCsvValidator(file.importedData[firstRow], firstLineNumber).preValidate(file.header);
      break;
    case 'Training':
      passedCheck = new TrainingCsvValidator(file.importedData[firstRow], firstLineNumber).preValidate(file.header);

      break;
  }

  if (passedCheck) {
    // count records and update metadata
    file.metaData.records = file.importedData.length;
    uploadAsJSON(
      username,
      establishmentId,
      file.metaData,
      `${establishmentId}/latest/${file.metaData.filename}.metadata.json`,
    );
  } else {
    // reset metadata filetype because this is not an expected establishment
    file.metaData.fileType = 'CSV';
  }
};
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
    },
  };
};
const generateReturnData = (metaData) => ({
  filename: metaData.filename,
  uploaded: metaData.lastModified,
  username: metaData.userName ? metaData.userName : null,
  records: metaData.records ? metaData.records : null,
  errors: 0,
  warnings: 0,
  fileType: metaData.fileType,
  size: metaData.size,
  key: metaData.key,
});

const uploadedPut = async (req, res) => {
  const establishmentId = req.establishmentId;
  const username = req.username;
  const myDownloads = [];
  const returnData = [];

  try {
    // awaits must be within a try/catch block - checking if file exists - saves having to repeatedly download from S3 bucket
    const createModelPromises = [];

    const data = await s3
      .listObjects({
        Bucket,
        Prefix: `${req.establishmentId}/latest/`,
      })
      .promise();

    data.Contents.forEach((myFile) => {
      const ignoreMetaDataObjects = /.*metadata.json$/;
      const ignoreRoot = /.*\/$/;

      if (!ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)) {
        createModelPromises.push(downloadContent(myFile.Key, myFile.Size, myFile.LastModified));
      }
    });

    const allContent = await Promise.all(createModelPromises);

    allContent.forEach((myfile) => {
      if (EstablishmentCsvValidator.isContent(myfile.data)) {
        myDownloads.push(createMyFileObject(myfile, 'Establishment'));
      } else if (WorkerCsvValidator.isContent(myfile.data)) {
        myDownloads.push(createMyFileObject(myfile, 'Worker'));
      } else if (TrainingCsvValidator.isContent(myfile.data)) {
        myDownloads.push(createMyFileObject(myfile, 'Training'));
      } else {
        myDownloads.push(createMyFileObject(myfile, 'CSV'));
      }
    });

    await Promise.all(
      myDownloads.map(async (file) => {
        if (!['Worker', 'Establishment', 'Training'].includes(file.type)) {
          return;
        }
        file.importedData = await csv().fromString(file.data);
        const lastpos = file.data.indexOf('\n') > -1 ? file.data.indexOf('\n') : file.data.length;
        file.header = file.data.substring(0, lastpos).trim();
      }),
    );

    await Promise.all(
      myDownloads.map(async (file) => {
        if (!['Worker', 'Establishment', 'Training'].includes(file.type)) {
          return;
        }
        await updateMetaData(file, username, establishmentId);
      }),
    );

    // for (const file of myDownloads) {
    //   if(!['Worker','Establishment','Training'].includes(file.type)){ return; }
    //   await updateMetaData(file,username,establishmentId);
    // }

    // now form response for each file
    myDownloads.forEach((file) => {
      returnData.push(generateReturnData(file.metaData));
    });

    await saveResponse(req, res, 200, returnData);
  } catch (err) {
    console.error(err);
    await saveResponse(req, res, 503, {});
  }
};

const uploadedStarGet = async (req, res) => {
  const Key = req.params['0'];
  const elements = Key.split('/');

  try {
    const objHeadData = await s3
      .headObject({
        Bucket,
        Key,
      })
      .promise();

    await saveResponse(req, res, 200, {
      file: {
        filename: elements[elements.length - 1],
        uploaded: objHeadData.LastModified,
        username: objHeadData.Metadata.username,
        size: objHeadData.ContentLength,
        key: Key,
        signedUrl: s3.getSignedUrl('getObject', {
          Bucket,
          Key,
          Expires: config.get('bulkupload.uploadSignedUrlExpire'),
        }),
      },
    });
  } catch (err) {
    if (err.code && err.code === 'NotFound') {
      await saveResponse(req, res, 404, {});
    } else {
      console.error(err);
      await saveResponse(req, res, 503, {});
    }
  }
};

const { acquireLock } = require('./lock');
const router = require('express').Router();

router.route('/').get(acquireLock.bind(null, uploadedGet, buStates.DOWNLOADING));
router.route('/').post(acquireLock.bind(null, uploadedPost, buStates.UPLOADING));
router.route('/').put(acquireLock.bind(null, uploadedPut, buStates.UPLOADING));
router.route('/*').get(acquireLock.bind(null, uploadedStarGet, buStates.DOWNLOADING));

module.exports = router;
