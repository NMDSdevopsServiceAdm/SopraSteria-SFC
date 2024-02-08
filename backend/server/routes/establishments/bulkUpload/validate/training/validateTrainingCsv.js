'use strict';

const { Training } = require('../../../../../models/classes/training');
const { validateTrainingLambda } = require('../../lambda');

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
  const { APITrainingRecord, JSONTrainingRecord, validationErrors } = await validateTrainingLambda(
    thisLine,
    currentLineNumber,
  );

  try {
    const thisApiTraining = new Training();
    const isValid = await thisApiTraining.load(APITrainingRecord);

    if (isValid || thisApiTraining.errors.length === 0) {
      APITrainingRecords[currentLineNumber] = thisApiTraining;
    }
  } catch (err) {
    console.error('WA - localised validate training error until validation card', err);
  }

  csvTrainingSchemaErrors.push(...validationErrors);

  JSONTraining.push(JSONTrainingRecord);
};

module.exports = {
  validateTrainingCsv,
};
