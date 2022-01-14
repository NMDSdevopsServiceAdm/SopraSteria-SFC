const EstablishmentCsvValidator = require('./establishments').Establishment;
const WorkerCsvValidator = require('../../../../lambdas/bulkUpload/classes/workerCSVValidator.js').WorkerCsvValidator;
const TrainingCsvValidator = require('./training').Training;
const mappings = require('../BUDI').mappings;

const validatorFactory = (type, firstRow, firstLineNumber) => {
  const factories = {
    Establishment: EstablishmentCsvValidator,
    Worker: WorkerCsvValidator,
    Training: TrainingCsvValidator,
  };

  if (type === 'Worker') return new factories[type](firstRow, firstLineNumber, null, mappings);

  return new factories[type](firstRow, firstLineNumber);
};
module.exports.validatorFactory = validatorFactory;
