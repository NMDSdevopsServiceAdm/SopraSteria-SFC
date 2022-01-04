'use strict';

const { Worker } = require('../../../../../models/classes/worker');
const { Qualification } = require('../../../../../models/classes/qualification');

const WorkerCsvValidator = require('../../../../../models/BulkImport/csv/workers').Worker;

const loadWorkerQualifications = async (lineValidator, thisQual, thisApiWorker) => {
  const thisApiQualification = new Qualification();

  // load while ignoring the "column" attribute (being the CSV column index, e.g "03" from which the qualification is mapped)
  const isValid = await thisApiQualification.load(thisQual);

  if (isValid) {
    // associate the qualification entity to the Worker
    thisApiWorker.associateQualification(thisApiQualification);
  } else {
    const errors = thisApiQualification.errors;
    const warnings = thisApiQualification.warnings;

    lineValidator.addQualificationAPIValidation(thisQual.column, errors, warnings);

    if (errors.length === 0) {
      // associate the qualification entity to the Worker
      thisApiWorker.associateQualification(thisApiQualification);
    }
  }
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

const validateWorkerCsvLine = async (
  thisLine,
  currentLineNumber,
  csvWorkerSchemaErrors,
  myAPIWorkers,
  myCurrentEstablishments,
  myJSONWorkers,
) => {
  const existingWorker = findExistingWorker(thisLine, myCurrentEstablishments);

  const lineValidator = new WorkerCsvValidator(thisLine, currentLineNumber, existingWorker);

  lineValidator.validate();
  lineValidator.transform();

  const thisWorkerAsAPI = lineValidator.toAPI();
  // .toQualificationAPI()
  // .toAPI()
  // .toJSON(true)

  try {
    // construct Worker entity
    const thisApiWorker = new Worker();
    await thisApiWorker.load(thisWorkerAsAPI);

    if (thisApiWorker.validate()) {
      // no validation errors in the entity itself, so add it ready for completion
      myAPIWorkers[currentLineNumber] = thisApiWorker;

      // construct Qualification entities (can be multiple of a single Worker record) - regardless of whether the
      //  Worker is valid or not; we need to return as many errors/warnings in one go as possible
      await Promise.all(
        lineValidator
          .toQualificationAPI()
          .map((thisQual) => loadWorkerQualifications(lineValidator, thisQual, thisApiWorker)),
      );
    } else {
      const errors = thisApiWorker.errors;

      if (errors.length === 0) {
        myAPIWorkers[currentLineNumber] = thisApiWorker;
      }
    }
  } catch (err) {
    console.error('WA - localised validate workers error until validation card', err);
  }

  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach((thisError) => csvWorkerSchemaErrors.push(thisError));
  }

  myJSONWorkers.push(lineValidator.toJSON(true));
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
