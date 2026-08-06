'use strict';
const csv = require('csvtojson');

const { MetaData } = require('../../../models/BulkImport/csv/metaData');
const WorkplaceCSVValidator = require('../../../models/BulkImport/csv/workplaceCSVValidator').WorkplaceCSVValidator;
const { validateWorkerHeaders } = require('./validate/headers/worker');
const { validateTrainingHeaders } = require('./validate/headers/training');
const { isWorkerFile, isTrainingFile } = require('./whichFile');
const BulkUploadS3Utils = require('./s3');
const { buStates } = require('./states');
const buUtils = require('../../../utils/bulkUploadUtils');

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

          const username = objData?.Metadata?.username ?? '';

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

  const MINIMUM_NUMBER_OF_FILES = 2;
  const MAXIMUM_NUMBER_OF_FILES = 3;

  if (
    !uploadedFiles ||
    !Array.isArray(uploadedFiles) ||
    uploadedFiles.length < MINIMUM_NUMBER_OF_FILES ||
    uploadedFiles.length > MAXIMUM_NUMBER_OF_FILES
  ) {
    await BulkUploadS3Utils.saveResponse(req, res, 400, {});
    return;
  }

  try {
    // clean up existing bulk upload objects
    await BulkUploadS3Utils.purgeBulkUploadS3Objects(establishmentId);

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
  const myDownloads = {};
  const establishmentMetadata = new MetaData();
  const workerMetadata = new MetaData();
  const trainingMetadata = new MetaData();

  try {
    // awaits must be within a try/catch block - checking if file exists - saves having to repeatedly download from S3 bucket
    const createModelPromises = [];

    const data = await BulkUploadS3Utils.listLatestObjectsInWorkplaceBucket(req.establishmentId);

    const dataContents = data.Contents ?? [];
    dataContents.forEach((myFile) => {
      const ignoreMetaDataObjects = /.*metadata.json$/;
      const ignoreRoot = /.*\/$/;

      if (!ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)) {
        createModelPromises.push(BulkUploadS3Utils.downloadContent(myFile.Key, myFile.Size, myFile.LastModified));
      }
    });

    const allContent = await Promise.all(createModelPromises);

    allContent.forEach((myfile) => {
      if (WorkplaceCSVValidator.isContent(myfile.data)) {
        myDownloads.establishments = myfile.data;
        establishmentMetadata.filename = myfile.filename;
        establishmentMetadata.fileType = 'Establishment';
        establishmentMetadata.userName = myfile.username;
        establishmentMetadata.size = myfile.size;
        establishmentMetadata.key = myfile.key;
        establishmentMetadata.lastModified = myfile.lastModified;
      } else if (isWorkerFile(myfile.data)) {
        myDownloads.workers = myfile.data;
        workerMetadata.filename = myfile.filename;
        workerMetadata.fileType = 'Worker';
        workerMetadata.userName = myfile.username;
        workerMetadata.size = myfile.size;
        workerMetadata.key = myfile.key;
        workerMetadata.lastModified = myfile.lastModified;
      } else if (isTrainingFile(myfile.data)) {
        myDownloads.trainings = myfile.data;
        trainingMetadata.filename = myfile.filename;
        trainingMetadata.fileType = 'Training';
        trainingMetadata.userName = myfile.username;
        trainingMetadata.size = myfile.size;
        trainingMetadata.key = myfile.key;
        trainingMetadata.lastModified = myfile.lastModified;
      }
    });

    let workerHeaders;
    let establishmentHeaders;
    let trainingHeaders;
    let importedWorkers = null;
    let importedEstablishments = null;
    let importedTraining = null;

    const headerPromises = [];

    if (myDownloads.establishments) {
      importedEstablishments = await csv().fromString(myDownloads.establishments);
      const positionOfNewline = myDownloads.establishments.indexOf('\n');
      const headerLine = myDownloads.establishments.substring(0, positionOfNewline);
      establishmentHeaders = headerLine.trim();
    }

    if (myDownloads.workers) {
      importedWorkers = await csv().fromString(myDownloads.workers);
      const positionOfNewline = myDownloads.workers.indexOf('\n');
      const headerLine = myDownloads.workers.substring(0, positionOfNewline);
      workerHeaders = headerLine.trim();
    }

    if (myDownloads.trainings) {
      importedTraining = await csv().fromString(myDownloads.trainings);
      const positionOfNewline = myDownloads.trainings.indexOf('\n');
      const headerLine = myDownloads.trainings.substring(0, positionOfNewline);
      trainingHeaders = headerLine.trim();
    }

    await Promise.all(headerPromises);

    const firstRow = 0;
    const firstLineNumber = 1;
    const metadataS3Promises = [];

    if (importedEstablishments) {
      if (
        new WorkplaceCSVValidator(importedEstablishments[firstRow], firstLineNumber).preValidate(establishmentHeaders)
      ) {
        // count records and update metadata
        establishmentMetadata.records = importedEstablishments.length;
        metadataS3Promises.push(
          BulkUploadS3Utils.uploadJSONDataToS3(
            username,
            establishmentId,
            establishmentMetadata,
            `latest/${establishmentMetadata.filename}.metadata`,
          ),
        );
      } else {
        // reset metadata filetype because this is not an expected establishment
        establishmentMetadata.fileType = null;
      }
    }

    if (importedWorkers) {
      if (validateWorkerHeaders(workerHeaders)) {
        // count records and update metadata
        workerMetadata.records = importedWorkers.length;
        metadataS3Promises.push(
          BulkUploadS3Utils.uploadJSONDataToS3(
            username,
            establishmentId,
            workerMetadata,
            `latest/${workerMetadata.filename}.metadata`,
          ),
        );
      } else {
        // reset metadata filetype because this is not an expected establishment
        workerMetadata.fileType = null;
      }
    }

    if (importedTraining) {
      if (validateTrainingHeaders(trainingHeaders)) {
        // count records and update metadata
        trainingMetadata.records = importedTraining.length;
        metadataS3Promises.push(
          BulkUploadS3Utils.uploadJSONDataToS3(
            username,
            establishmentId,
            trainingMetadata,
            `latest/${trainingMetadata.filename}.metadata`,
          ),
        );
      } else {
        // reset metadata filetype because this is not an expected establishment
        trainingMetadata.fileType = null;
      }
    }

    // ////////////////////////////////////
    await Promise.all(metadataS3Promises);

    const generateReturnData = (metaData) => ({
      filename: metaData.filename,
      uploaded: metaData.lastModified,
      username: metaData.userName ? metaData.userName : null,
      records: metaData.records,
      errors: 0,
      warnings: 0,
      fileType: metaData.fileType,
      size: metaData.size,
      key: metaData.key,
    });

    const returnData = [];

    // now forn response for each file
    dataContents.forEach((myFile) => {
      const ignoreMetaDataObjects = /.*metadata.json$/;
      const ignoreRoot = /.*\/$/;
      if (!ignoreMetaDataObjects.test(myFile.Key) && !ignoreRoot.test(myFile.Key)) {
        if (myFile.Key === establishmentMetadata.key) {
          returnData.push(generateReturnData(establishmentMetadata));
        } else if (myFile.Key === workerMetadata.key) {
          returnData.push(generateReturnData(workerMetadata));
        } else if (myFile.Key === trainingMetadata.key) {
          returnData.push(generateReturnData(trainingMetadata));
        } else {
          const fileNameElements = myFile.Key.split('/');
          const fileName = fileNameElements[fileNameElements.length - 1];

          returnData.push(
            generateReturnData({
              filename: fileName,
              uploaded: myFile.LastModified,
              username: myFile.username,
              records: 0,
              errors: 0,
              warnings: 0,
              fileType: null,
              size: myFile.size,
              key: myFile.Key,
            }),
          );
        }
      }
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
      case 'Workplace':
      case 'Training': {
        updatedData = data;
        break;
      }
      case 'Staff': {
        updatedData = await buUtils.staffData(data, downloadType);
        break;
      }
      case 'StaffSanitise': {
        updatedData = await buUtils.staffData(data, downloadType);
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

module.exports.uploadedStarGet = uploadedStarGet;
