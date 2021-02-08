'use strict';

const postcodes = require('../../../../models/postcodes');
const { Worker } = require('../../../../models/classes/worker');
const { Qualification } = require('../../../../models/classes/qualification');

const WorkerCsvValidator = require('../../../../models/BulkImport/csv/workers').Worker;

const loadWorkerQualifications = async (
  lineValidator,
  thisQual,
  thisApiWorker,
  myAPIQualifications,
  keepAlive = () => {},
) => {
  const thisApiQualification = new Qualification();

  // load while ignoring the "column" attribute (being the CSV column index, e.g "03" from which the qualification is mapped)
  const isValid = await thisApiQualification.load(thisQual);

  keepAlive('qualification loaded', lineValidator.lineNumber);

  if (isValid) {
    // no validation errors in the entity itself, so add it ready for completion
    myAPIQualifications[lineValidator.lineNumber] = thisApiQualification;

    // associate the qualification entity to the Worker
    thisApiWorker.associateQualification(thisApiQualification);
  } else {
    const errors = thisApiQualification.errors;
    const warnings = thisApiQualification.warnings;

    lineValidator.addQualificationAPIValidation(thisQual.column, errors, warnings);

    if (errors.length === 0) {
      myAPIQualifications[lineValidator.lineNumber] = thisApiQualification;

      // associate the qualification entity to the Worker
      thisApiWorker.associateQualification(thisApiQualification);
    }
  }
};

const validateWorkerCsv = async (
  thisLine,
  currentLineNumber,
  csvWorkerSchemaErrors,
  myWorkers,
  myAPIWorkers,
  myAPIQualifications,
  myCurrentEstablishments,
  keepAlive = () => {},
) => {
  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  const lineValidator = new WorkerCsvValidator(thisLine, currentLineNumber, myCurrentEstablishments);

  lineValidator.validate();
  lineValidator.transform();

  const thisWorkerAsAPI = lineValidator.toAPI();

  try {
    const foundCurrentEstablishment = myCurrentEstablishments.find(
      (establishment) => establishment.key === lineValidator.establishmentKey,
    );
    const foundCurrentWorker = foundCurrentEstablishment.theWorker(lineValidator.key);

    if (thisWorkerAsAPI.postcode && foundCurrentWorker && foundCurrentWorker.postcode !== thisWorkerAsAPI.postcode) {
      const { Latitude, Longitude } = (await postcodes.firstOrCreate(thisWorkerAsAPI.postcode)) || {};

      thisWorkerAsAPI.Latitude = Latitude;
      thisWorkerAsAPI.Longitude = Longitude;
    }

    // construct Worker entity
    const thisApiWorker = new Worker();
    await thisApiWorker.load(thisWorkerAsAPI);

    keepAlive('worker loaded', currentLineNumber);

    if (thisApiWorker.validate()) {
      // no validation errors in the entity itself, so add it ready for completion
      myAPIWorkers[currentLineNumber] = thisApiWorker;

      // construct Qualification entities (can be multiple of a single Worker record) - regardless of whether the
      //  Worker is valid or not; we need to return as many errors/warnings in one go as possible
      await Promise.all(
        lineValidator
          .toQualificationAPI()
          .map((thisQual) =>
            loadWorkerQualifications(lineValidator, thisQual, thisApiWorker, myAPIQualifications, keepAlive),
          ),
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

  myWorkers.push(lineValidator);
};

module.exports = {
  validateWorkerCsv,
};
