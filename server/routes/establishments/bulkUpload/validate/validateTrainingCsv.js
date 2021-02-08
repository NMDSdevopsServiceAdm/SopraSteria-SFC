'use strict';

const { Training } = require('../../../../models/classes/training');
const TrainingCsvValidator = require('../../../../models/BulkImport/csv/training').Training;

const validateTrainingCsv = async (
  thisLine,
  currentLineNumber,
  csvTrainingSchemaErrors,
  myTrainings,
  myAPITrainings,
  keepAlive = () => {},
) => {
  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  const lineValidator = new TrainingCsvValidator(thisLine, currentLineNumber);

  lineValidator.validate();
  lineValidator.transform();

  const thisTrainingAsAPI = lineValidator.toAPI();
  try {
    const thisApiTraining = new Training();
    const isValid = await thisApiTraining.load(thisTrainingAsAPI);

    keepAlive('training loaded', currentLineNumber);

    if (isValid) {
      // no validation errors in the entity itself, so add it ready for completion
      myAPITrainings[currentLineNumber] = thisApiTraining;
    } else {
      const errors = thisApiTraining.errors;

      if (errors.length === 0) {
        myAPITrainings[currentLineNumber] = thisApiTraining;
      }
    }
  } catch (err) {
    console.error('WA - localised validate training error until validation card', err);
  }

  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach((thisError) => csvTrainingSchemaErrors.push(thisError));
  }

  myTrainings.push(lineValidator);
};

module.exports = {
  validateTrainingCsv,
};
