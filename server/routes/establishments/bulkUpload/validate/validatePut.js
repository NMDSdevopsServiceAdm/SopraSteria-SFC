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
  const keepAlive = (stepName = '', stepId = '') => {
    console.log(`Bulk Upload /validate keep alive: ${new Date()} ${stepName} ${stepId}`);
  };

  const establishments = {
    imported: null,
  };

  const workers = {
    imported: null,
  };

  const training = {
    imported: null,
    trainingMetadata: new MetaData(),
  };

  const establishmentId = req.establishmentId;

  try {
    // get list of files from S3.s3 bucket
    const bucketFiles = await S3.listObjectsInBucket(establishmentId);

    await Promise.all(
      bucketFiles.Contents.map(async (fileInfo) => {
        keepAlive('bucket listed'); // keep connection alive

        if (!(/.*metadata.json$/.test(fileInfo.Key) || /.*\/$/.test(fileInfo.Key))) {
          const file = await S3.downloadContent(fileInfo.Key);
          // for each downloaded file, test its type then update the closure variables
          keepAlive('file downloaded', `${fileInfo.Key}`); // keep connection alive

          // figure out which type of csv this file is and load the data
          if (establishments.imported === null && EstablishmentCsvValidator.isContent(file.data)) {
            establishments.establishmentMetadata = getMetaData(file, 'Establishment');
            establishments.imported = await generateJSONFromCSV(file);
          } else if (workers.imported === null && WorkerCsvValidator.isContent(file.data)) {
            workers.workerMetadata = getMetaData(file, 'Worker');
            workers.imported = await generateJSONFromCSV(file);
          } else if (training.imported === null && TrainingCsvValidator.isContent(file.data)) {
            training.trainingMetadata = getMetaData(file, 'Training');
            training.imported = await generateJSONFromCSV(file);
          }
          // parse the file contents as csv then return the data
        }
      }),
    );
    // validate the csv files we found

    console.log(establishments);

    const validationResponse = await validateBulkUploadFiles(
      true,
      req.username,
      establishmentId,
      req.isParent,
      establishments,
      workers,
      training,
      keepAlive,
    );
    // set what the next state should be
    res.buValidationResult = validationResponse.status;

    // handle parsing errors
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

const getMetaData = (file, fileType) => {
  const metadata = new MetaData();

  metadata.filename = file.filename;
  metadata.fileType = fileType;
  metadata.userName = file.username;

  return metadata;
};

const generateJSONFromCSV = async (file) => {
  return await csv().fromString(file.data);
};

(async () => {
  await validatePut(workerData.req, workerData.res);

  models.sequelize.close();
  process.exit(0);
})();
