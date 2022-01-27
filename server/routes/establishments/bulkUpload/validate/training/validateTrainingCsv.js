'use strict';

const { Training } = require('../../../../../models/classes/training');
const { TrainingCsvValidator } = require('../../../../../models/BulkImport/csv/trainingCSVValidator');

const validateTrainingCsv = async (training) => {
  const JSONTraining = [];
  const APITrainingRecords = {};
  const csvTrainingSchemaErrors = [];

  if (training.imported) {
    await Promise.all(
      training.imported.map(
        async (thisLine, currentLineNumber) =>
          await validateTrainingCsvLine(
            thisLine,
            currentLineNumber + 2,
            csvTrainingSchemaErrors,
            JSONTraining,
            APITrainingRecords,
          ),
      ),
    );
  }

  return { csvTrainingSchemaErrors, JSONTraining, APITrainingRecords };
};

const validateTrainingCsvLine = async (
  thisLine,
  currentLineNumber,
  csvTrainingSchemaErrors,
  JSONTraining,
  APITrainingRecords,
) => {
  const lineValidator = new TrainingCsvValidator(thisLine, currentLineNumber);

  lineValidator.validate();
  lineValidator.transform();

  const thisTrainingAsAPI = lineValidator.toAPI();
  const validationErrors = lineValidator.validationErrors;

  try {
    const thisApiTraining = new Training();
    const isValid = await thisApiTraining.load(thisTrainingAsAPI);

    if (isValid) {
      APITrainingRecords[currentLineNumber] = thisApiTraining;
    } else if (thisApiTraining.errors.length === 0) {
      APITrainingRecords[currentLineNumber] = thisApiTraining;
    }
  } catch (err) {
    console.error('WA - localised validate training error until validation card', err);
  }

  csvTrainingSchemaErrors.push(...validationErrors);

  JSONTraining.push(lineValidator.toJSON());
};

module.exports = {
  validateTrainingCsv,
};
