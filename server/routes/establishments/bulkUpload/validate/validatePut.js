'use strict';
const csv = require('csvtojson');

const { MetaData } = require('../../../../models/BulkImport/csv/metaData');
const models = require('../../../../models');
const { getFileType } = require('../whichFile');
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
          const fileType = getFileType(file.data);

          if (files[fileType].imported === null) {
            files[fileType].metadata = getMetadata(file, fileType);
            files[fileType].imported = await generateJSONFromCSV(file.data);
          }
        }
      }),
    );

    const validationResponse = await validateBulkUploadFiles(req, files);

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

const generateJSONFromCSV = async (fileData) => {
  return await csv().fromString(fileData);
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
  generateJSONFromCSV,
};
