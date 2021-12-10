'use strict';
const csv = require('csvtojson');
const { MetaData } = require('../../../../models/BulkImport/csv/metaData');
const models = require('../../../../models');

const EstablishmentCsvValidator = require('../../../../models/BulkImport/csv/establishments').Establishment;
const WorkerCsvValidator = require('../../../../models/BulkImport/csv/workers').Worker;
const TrainingCsvValidator = require('../../../../models/BulkImport/csv/training').Training;

const S3 = require('../s3');
const { validateBulkUploadFiles } = require('./validateBulkUploadFiles');
const { workerData } = require('worker_threads');
const { completeLock } = require('../lock');
const { buStates } = require('../states');

const Sentry = require('@sentry/node');

const validatePut = async (req, res) => {
  const files = {
    Establishment: {
      imported: null,
    },
    Worker: {
      imported: null,
    },
    Training: {
      imported: null,
      metadata: new MetaData(),
    },
  };

  try {
    const bucketFiles = await S3.listObjectsInBucket(req.establishmentId);

    await Promise.all(
      bucketFiles.Contents.map(async (fileInfo) => {
        if (isNotMetadata(fileInfo.Key)) {
          const file = await S3.downloadContent(fileInfo.Key);
          const fileType = getFileType(file);

          if (files[fileType].imported === null) {
            files[fileType].metadata = getMetadata(file, fileType);
            files[fileType].imported = await generateJSONFromCSV(file);
          }
        }
      }),
    );

    const validationResponse = await validateBulkUploadFiles(true, req, files, keepAlive);

    res.buValidationResult = validationResponse.status;

    await S3.saveResponse(req, res, 200, {
      establishment: validationResponse.metaData.establishments.toJSON(),
      workers: validationResponse.metaData.workers.toJSON(),
      training: validationResponse.metaData.training.toJSON(),
    });

    await completeLock(req, res, buStates.VALIDATING, buStates.READY);
  } catch (err) {
    console.error(err);
    Sentry.captureException(err);

    await S3.saveResponse(req, res, 500, {});
  }
};

const getMetadata = (file, fileType) => {
  const metadata = new MetaData();

  metadata.filename = file.filename;
  metadata.fileType = fileType;
  metadata.userName = file.username;

  return metadata;
};

const generateJSONFromCSV = async (file) => {
  return await csv().fromString(file.data);
};

const keepAlive = (stepName = '', stepId = '') => {
  console.log(`Bulk Upload /validate keep alive: ${new Date()} ${stepName} ${stepId}`);
};

const getFileType = (file) => {
  if (EstablishmentCsvValidator.isContent(file.data)) {
    return 'Establishment';
  } else if (WorkerCsvValidator.isContent(file.data)) {
    return 'Worker';
  } else if (TrainingCsvValidator.isContent(file.data)) {
    return 'Training';
  }
};

const isNotMetadata = (fileKey) => !(/.*metadata.json$/.test(fileKey) || /.*\/$/.test(fileKey));

(async () => {
  await validatePut(workerData.req, workerData.res);

  models.sequelize.close();
  process.exit(0);
})();

module.exports = {
  getMetadata,
  isNotMetadata,
};
