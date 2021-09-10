'use strict';
const csv = require('csvtojson');
const config = require('../../../config/config');
const { MetaData } = require('../../../models/BulkImport/csv/metaData');
const EstablishmentCsvValidator = require('../../../models/BulkImport/csv/establishments').Establishment;
const WorkerCsvValidator = require('../../../models/BulkImport/csv/workers').Worker;
const TrainingCsvValidator = require('../../../models/BulkImport/csv/training').Training;

const { s3, Bucket, saveResponse, uploadAsJSON, downloadContent, purgeBulkUploadS3Objects } = require('./s3');
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

    await saveResponse(req, res, 500, {});
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
    await saveResponse(req, res, 400, {});
    return;
  }

  try {
    // clean up existing bulk upload objects
    await purgeBulkUploadS3Objects(establishmentId);

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
    await saveResponse(req, res, 500, {});
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
        myDownloads.establishments = myfile.data;
        establishmentMetadata.filename = myfile.filename;
        establishmentMetadata.fileType = 'Establishment';
        establishmentMetadata.userName = myfile.username;
        establishmentMetadata.size = myfile.size;
        establishmentMetadata.key = myfile.key;
        establishmentMetadata.lastModified = myfile.lastModified;
      } else if (WorkerCsvValidator.isContent(myfile.data)) {
        myDownloads.workers = myfile.data;
        workerMetadata.filename = myfile.filename;
        workerMetadata.fileType = 'Worker';
        workerMetadata.userName = myfile.username;
        workerMetadata.size = myfile.size;
        workerMetadata.key = myfile.key;
        workerMetadata.lastModified = myfile.lastModified;
      } else if (TrainingCsvValidator.isContent(myfile.data)) {
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

    // ////////////////////////////
    const firstRow = 0;
    const firstLineNumber = 1;
    const metadataS3Promises = [];

    if (importedEstablishments) {
      if (
        new EstablishmentCsvValidator(importedEstablishments[firstRow], firstLineNumber).preValidate(
          establishmentHeaders,
        )
      ) {
        // count records and update metadata
        establishmentMetadata.records = importedEstablishments.length;
        metadataS3Promises.push(
          uploadAsJSON(
            username,
            establishmentId,
            establishmentMetadata,
            `${establishmentId}/latest/${establishmentMetadata.filename}.metadata.json`,
          ),
        );
      } else {
        // reset metadata filetype because this is not an expected establishment
        establishmentMetadata.fileType = null;
      }
    }

    if (importedWorkers) {
      if (new WorkerCsvValidator(importedWorkers[firstRow], firstLineNumber).preValidate(workerHeaders)) {
        // count records and update metadata
        workerMetadata.records = importedWorkers.length;
        metadataS3Promises.push(
          uploadAsJSON(
            username,
            establishmentId,
            workerMetadata,
            `${establishmentId}/latest/${workerMetadata.filename}.metadata.json`,
          ),
        );
      } else {
        // reset metadata filetype because this is not an expected establishment
        workerMetadata.fileType = null;
      }
    }

    if (importedTraining) {
      if (new TrainingCsvValidator(importedTraining[firstRow], firstLineNumber).preValidate(trainingHeaders)) {
        // count records and update metadata
        trainingMetadata.records = importedTraining.length;
        metadataS3Promises.push(
          uploadAsJSON(
            username,
            establishmentId,
            trainingMetadata,
            `${establishmentId}/latest/${trainingMetadata.filename}.metadata.json`,
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
    data.Contents.forEach((myFile) => {
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

    await saveResponse(req, res, 200, returnData);
  } catch (err) {
    console.error(err);
    await saveResponse(req, res, 500, {});
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
      console.log(err);
      await saveResponse(req, res, 500, {});
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
