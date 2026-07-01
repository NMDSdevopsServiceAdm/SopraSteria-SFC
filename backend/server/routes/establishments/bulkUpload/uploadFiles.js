'use strict';
const csv = require('csvtojson');

const BulkUploadS3Utils = require('./s3');
const { buStates } = require('./states');
const WorkplaceCSVValidator = require('../../../models/BulkImport/csv/workplaceCSVValidator').WorkplaceCSVValidator;
const { getFileType } = require('./whichFile');
const { validateWorkerHeaders } = require('../bulkUpload/validate/headers/worker');
const { validateTrainingHeaders } = require('../bulkUpload/validate/headers/training');
const buUtils = require('../../../utils/bulkUploadUtils');

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

  let passedCheck;
  if (file.type === 'Worker') {
    passedCheck = validateWorkerHeaders(file.header);
  } else if (file.type === 'Training') {
    passedCheck = validateTrainingHeaders(file.header);
  } else {
    const validator = new WorkplaceCSVValidator(file.importedData[firstRow], firstLineNumber);
    passedCheck = validator.preValidate(file.header);
  }

  if (!passedCheck) {
    file.metaData.fileType = null;
  } else {
    file.metaData.records = file.importedData.length;
  }

  // count records and update metadata
  BulkUploadS3Utils.uploadJSONDataToS3(
    username,
    establishmentId,
    file.metaData,
    `latest/${file.metaData.filename}.metadata`,
  );
};

const uploadedGet = async (req, res) => {
  try {
    const ignoreMetaDataObjects = /.*metadata.json$/;
    const ignoreRoot = /.*\/$/;

    const data = await BulkUploadS3Utils.listLatestObjectsInWorkplaceBucket(req.establishmentId);
    const dataContents = data.Contents ?? [];
    const returnData = await Promise.all(
      dataContents
        .filter((myFile) => !ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key))
        .map(async (file) => {
          const elements = file.Key.split('/');

          const objData = await BulkUploadS3Utils.headObjectInBucket(file.Key);

          const username = objData && objData.Metadata ? objData.Metadata.username : '';

          const fileMetaData = dataContents.filter((myFile) => myFile.Key === file.Key + '.metadata.json');

          let metadataJSON = {};

          if (fileMetaData.length === 1) {
            const metaData = await BulkUploadS3Utils.downloadContent(fileMetaData[0].Key);
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
        }),
    );
    await BulkUploadS3Utils.saveResponse(req, res, 200, {
      establishment: {
        uid: req.establishmentId,
      },
      files: returnData,
    });
  } catch (err) {
    console.error(err);

    await BulkUploadS3Utils.saveResponse(req, res, 500, {});
  }
};
const uploadedPost = async (req, res) => {
  const establishmentId = String(req.establishmentId);
  const username = req.username;
  const uploadedFiles = req.body.files;

  if (!uploadedFiles || !Array.isArray(uploadedFiles)) {
    await BulkUploadS3Utils.saveResponse(req, res, 400, {});
    return;
  }

  try {
    const filesAndSignedUrls = [];
    const filesWithName = uploadedFiles.filter((file) => file.filename);

    for (let file of filesWithName) {
      const signedUrl = await BulkUploadS3Utils.getSignedUrlForUpload({
        Key: `${establishmentId}/latest/${file.filename}`,
        ContentType: req.query.type,
        Metadata: {
          username,
          establishmentId,
          validationstatus: 'pending',
        },
      });
      filesAndSignedUrls.push({ ...file, signedUrl });
    }

    await BulkUploadS3Utils.saveResponse(req, res, 200, filesAndSignedUrls);
  } catch (err) {
    console.error('API POST bulkupload/uploaded: ', err);
    await BulkUploadS3Utils.saveResponse(req, res, 500, {});
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

    const data = await BulkUploadS3Utils.listLatestObjectsInWorkplaceBucket(req.establishmentId);
    const contents = data?.Contents ?? [];

    contents.forEach((myFile) => {
      const ignoreMetaDataObjects = /.*metadata.json$/;
      const ignoreRoot = /.*\/$/;

      if (!ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)) {
        createModelPromises.push(BulkUploadS3Utils.downloadContent(myFile.Key, myFile.Size, myFile.LastModified));
      }
    });

    const allContent = await Promise.all(createModelPromises);

    allContent.forEach((file) => {
      const fileType = getFileType(file.data);

      myDownloads.push(createMyFileObject(file, fileType));
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
    await BulkUploadS3Utils.saveResponse(req, res, 200, returnData);
  } catch (err) {
    console.error(err);
    await BulkUploadS3Utils.saveResponse(req, res, 500, {});
  }
};

const uploadedStarGet = async (req, res) => {
  const Key = req.params['0'];
  const elements = Key.split('/');

  try {
    const { downloadType } = req.query;
    const { data } = await BulkUploadS3Utils.downloadContent(Key);

    let updatedData;
    switch (downloadType) {
      case 'Staff': {
        updatedData = await buUtils.staffData(data, downloadType);
        break;
      }
      case 'StaffSanitise': {
        updatedData = await buUtils.staffData(data, downloadType);
        break;
      }

      default: {
        updatedData = data;
        break;
      }
    }

    await BulkUploadS3Utils.saveResponse(req, res, 200, updatedData, {
      'Content-Type': 'text/csv',
      'Content-disposition': `attachment; filename=${elements[elements.length - 1]}`,
    });
  } catch (err) {
    if (err.code && err.code === 'NotFound') {
      await BulkUploadS3Utils.saveResponse(req, res, 404, {});
    } else {
      console.error(err);
      await BulkUploadS3Utils.saveResponse(req, res, 500, {});
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
module.exports.uploadedStarGet = uploadedStarGet;
