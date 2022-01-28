'use strict';

const { TrainingCsvValidator } = require('../classes/trainingCSVValidator');

const validateTraining = async (event) => {
  const { thisLine, currentLineNumber, mappings } = event;

  return await runValidator(thisLine, currentLineNumber, mappings);
};

const runValidator = async (thisLine, currentLineNumber, mappings) => {
  const lineValidator = new TrainingCsvValidator(thisLine, currentLineNumber, mappings);

  lineValidator.validate();
  lineValidator.transform();

  const APITrainingRecord = lineValidator.toAPI();
  const JSONTrainingRecord = lineValidator.toJSON();
  const validationErrors = lineValidator.validationErrors;

  return {
    APITrainingRecord,
    JSONTrainingRecord,
    validationErrors,
  };
};

module.exports = {
  validateTraining,
};
