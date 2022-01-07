'use strict';

const { BUDI } = require('../classes/BUDI');
const { WorkerCsvValidator } = require('../classes/workerCSVValidator');

const validateWorker = async (event) => {
  const eventBody = JSON.parse(event.body);

  const { thisLine, currentLineNumber, existingWorker, mappings } = eventBody;

  await BUDI.initialize(mappings);

  return await runValidator(thisLine, currentLineNumber, existingWorker);
};

const runValidator = async (thisLine, currentLineNumber, existingWorker) => {
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

module.exports = {
  validateWorker,
};
