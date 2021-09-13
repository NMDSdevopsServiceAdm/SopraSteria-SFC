'use strict';
const csv = require('csvtojson');
const { MetaData } = require('../../../../models/BulkImport/csv/metaData');

const EstablishmentCsvValidator = require('../../../../models/BulkImport/csv/establishments').Establishment;
const WorkerCsvValidator = require('../../../../models/BulkImport/csv/workers').Worker;
const TrainingCsvValidator = require('../../../../models/BulkImport/csv/training').Training;

const { s3, Bucket, saveResponse, downloadContent } = require('../s3');
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
    establishmentMetadata: new MetaData(),
  };

  const workers = {
    imported: null,
    workerMetadata: new MetaData(),
  };

  const trainings = {
    imported: null,
    trainingMetadata: new MetaData(),
  };

  let estNotFound = true;
  let wrkNotFound = true;
  let trnNotFound = true;
  const establishmentId = req.establishmentId;

  try {
    // get list of files from s3 bucket
    await s3
      .listObjects({
        Bucket,
        Prefix: `${establishmentId}/latest/`,
      })
      .promise()

      // download the contents of the appropriate ones we find
      .then((data) =>
        Promise.all(
          data.Contents.reduce((arr, myFileStats) => {
            keepAlive('bucket listed'); // keep connection alive

            if (!(/.*metadata.json$/.test(myFileStats.Key) || /.*\/$/.test(myFileStats.Key))) {
              arr.push(
                downloadContent(myFileStats.Key)
                  // for each downloaded file, test its type then update the closure variables
                  .then((myFile) => {
                    keepAlive('file downloaded', `${myFileStats.Key}`); // keep connection alive

                    let obj = null;
                    let metadata = null;

                    // figure out which type of csv this file is and load the data
                    if (estNotFound && EstablishmentCsvValidator.isContent(myFile.data)) {
                      estNotFound = false;
                      obj = establishments;
                      metadata = establishments.establishmentMetadata;

                      metadata.filename = myFile.filename;
                      metadata.fileType = 'Establishment';
                      metadata.userName = myFile.username;
                    } else if (wrkNotFound && WorkerCsvValidator.isContent(myFile.data)) {
                      wrkNotFound = false;
                      obj = workers;
                      metadata = workers.workerMetadata;

                      metadata.filename = myFile.filename;
                      metadata.fileType = 'Worker';
                      metadata.userName = myFile.username;
                    } else if (trnNotFound && TrainingCsvValidator.isContent(myFile.data)) {
                      trnNotFound = false;
                      obj = trainings;
                      metadata = trainings.trainingMetadata;

                      metadata.filename = myFile.filename;
                      metadata.fileType = 'Training';
                      metadata.userName = myFile.username;
                    }

                    // if not one of our expected types then just return
                    if (obj === null) {
                      return true;
                    }
                    // parse the file contents as csv then return the data
                    return csv()
                      .fromString(myFile.data)
                      .then((imported) => {
                        keepAlive('csv parsed', myFileStats.Key); // keep connection alive

                        obj.imported = imported;

                        return true;
                      });
                  }),
              );
            }

            return arr;
          }, []),
        ),
      )

      // validate the csv files we found
      .then(async () => {
        const validationResponse = await validateBulkUploadFiles(
          true,
          req.username,
          establishmentId,
          req.isParent,
          establishments,
          workers,
          trainings,
          keepAlive,
        );
        // set what the next state should be
        res.buValidationResult = validationResponse.status;

        // handle parsing errors
        await saveResponse(req, res, 200, {
          establishment: validationResponse.metaData.establishments.toJSON(),
          workers: validationResponse.metaData.workers.toJSON(),
          training: validationResponse.metaData.training.toJSON(),
        });

        await completeLock(req, res, buStates.VALIDATING, buStates.READY);
      });
  } catch (err) {
    console.error(err);
    Sentry.captureException(err);

    await saveResponse(req, res, 500, {});
  }
};

(async () => {
  await validatePut(workerData.req, workerData.res);
})();
