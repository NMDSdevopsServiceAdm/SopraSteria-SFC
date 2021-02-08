const EstablishmentCsvValidator = require('./establishments').Establishment;
const WorkerCsvValidator = require('./workers').Worker;
const TrainingCsvValidator = require('./training').Training;

const validatorFactory = (type, firstRow, firstLineNumber) => {
  const factories = {
    Establishment: EstablishmentCsvValidator,
    Worker: WorkerCsvValidator,
    Training: TrainingCsvValidator,
  };

  return new factories[type](firstRow, firstLineNumber);
};
module.exports.validatorFactory = validatorFactory;
