'use strict';

const { Worker } = require('../../../../../models/classes/worker');
const { Qualification } = require('../../../../../models/classes/qualification');

const WorkerCsvValidator = require('../../../../../models/BulkImport/csv/workers').Worker;

const loadWorkerQualifications = async (thisQual, thisApiWorker) => {
  const thisApiQualification = new Qualification();

  await thisApiQualification.load(thisQual);

  thisApiWorker.associateQualification(thisApiQualification);
};

const findExistingWorker = (thisLine, myCurrentEstablishments) => {
  const establishmentUniqueID = thisLine.LOCALESTID.replace(/\s/g, '');
  const workerUniqueID = thisLine.UNIQUEWORKERID.replace(/\s/g, '');

  const foundEstablishment = myCurrentEstablishments.find(
    (currentEstablishment) => currentEstablishment.key === establishmentUniqueID,
  );

  if (foundEstablishment) {
    const worker = foundEstablishment.theWorker(workerUniqueID);
    if (worker) {
      return worker.toJSON(true, false);
    }
  }

  return null;
};

const runValidator = (thisLine, currentLineNumber, existingWorker) => {
  const lineValidator = new WorkerCsvValidator(thisLine, currentLineNumber, existingWorker);

  lineValidator.validate();
  lineValidator.transform();

  const thisWorkerAsAPI = lineValidator.toAPI();
  const thisWorkerQualificationsAsAPI = lineValidator.toQualificationAPI();
  const thisWorkerAsJSON = lineValidator.toJSON(true);
  const validationErrors = lineValidator.validationErrors;

  return {
    thisWorkerAsAPI,
    thisWorkerQualificationsAsAPI,
    thisWorkerAsJSON,
    validationErrors,
  };
};

const validateWorkerCsvLine = async (
  thisLine,
  currentLineNumber,
  csvWorkerSchemaErrors,
  myAPIWorkers,
  myCurrentEstablishments,
  myJSONWorkers,
) => {
  const existingWorker = findExistingWorker(thisLine, myCurrentEstablishments);

  const { thisWorkerAsAPI, thisWorkerQualificationsAsAPI, thisWorkerAsJSON, validationErrors } = runValidator(
    thisLine,
    currentLineNumber,
    existingWorker,
  );

  try {
    const thisApiWorker = new Worker();
    await thisApiWorker.load(thisWorkerAsAPI);

    if (thisApiWorker.validate()) {
      myAPIWorkers[currentLineNumber] = thisApiWorker;

      await Promise.all(
        thisWorkerQualificationsAsAPI.map((thisQual) => loadWorkerQualifications(thisQual, thisApiWorker)),
      );
    } else if (thisApiWorker.errors.length === 0) {
      myAPIWorkers[currentLineNumber] = thisApiWorker;
    }
  } catch (err) {
    console.error('WA - localised validate workers error until validation card', err);
  }

  csvWorkerSchemaErrors.push(...validationErrors);

  myJSONWorkers.push(thisWorkerAsJSON);
};

const validateWorkerCsv = async (workers, myCurrentEstablishments) => {
  const csvWorkerSchemaErrors = [];
  const myAPIWorkers = {};
  const myJSONWorkers = [];

  await Promise.all(
    workers.imported.map((thisLine, currentLineNumber) =>
      validateWorkerCsvLine(
        thisLine,
        currentLineNumber + 2,
        csvWorkerSchemaErrors,
        myAPIWorkers,
        myCurrentEstablishments,
        myJSONWorkers,
      ),
    ),
  );

  return { csvWorkerSchemaErrors, myAPIWorkers, myJSONWorkers };
};

module.exports = {
  validateWorkerCsv,
};
