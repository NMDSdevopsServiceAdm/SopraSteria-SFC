'use strict';

const { WorkerCsvValidator } = require('../classes/workerCSVValidator');

const validateWorker = async (event) => {
  const { thisLine, currentLineNumber, existingWorker, mappings } = event;

  return await runValidator(thisLine, currentLineNumber, existingWorker, mappings);
};

const runValidator = async (thisLine, currentLineNumber, existingWorker, mappings) => {
  const lineValidator = new WorkerCsvValidator(thisLine, currentLineNumber, existingWorker, mappings);

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

module.exports = {
  validateWorker,
};
