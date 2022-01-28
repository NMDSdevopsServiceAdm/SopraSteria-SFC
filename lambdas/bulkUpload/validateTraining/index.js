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

  const thisTrainingAsAPI = lineValidator.toAPI();
  const validationErrors = lineValidator.validationErrors;

  return {
    thisTrainingAsAPI,
    validationErrors,
  };
};

module.exports = {
  validateTraining,
};
