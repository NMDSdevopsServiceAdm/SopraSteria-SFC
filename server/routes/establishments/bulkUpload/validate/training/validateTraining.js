const { validateTrainingCsv } = require('../validateTrainingCsv');

exports.validateTraining = async (training) => {
  const myTrainings = [];
  const myAPITrainings = {};
  const csvTrainingSchemaErrors = [];

  if (training.imported) {
    await Promise.all(
      training.imported.map(
        async (thisLine, currentLineNumber) =>
          await validateTrainingCsv(
            thisLine,
            currentLineNumber + 2,
            csvTrainingSchemaErrors,
            myTrainings,
            myAPITrainings,
          ),
      ),
    );
  }

  return {
    csvTrainingSchemaErrors,
    myTrainings,
    myAPITrainings,
  };
};
