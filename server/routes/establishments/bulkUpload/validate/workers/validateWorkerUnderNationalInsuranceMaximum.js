const get = require('lodash/get');

const NI_WORKER_DUPLICATE_ERROR = () => 5570;

const worksOverNationalInsuranceMaximum = (thisWorker, workers) => {
  const workerTotalHours = workers.reduce((sum, thatWorker) => {
    if (thisWorker.niNumber !== undefined && thisWorker.niNumber === thatWorker.niNumber) {
      const thatWorkersCntHours = get(thatWorker, 'hours.contractedHours');
      const thatWorkersAvgHours = get(thatWorker, 'hours.averageHours');

      if (thatWorkersCntHours) {
        return sum + thatWorkersCntHours;
      }
      if (thatWorkersAvgHours) {
        return sum + thatWorkersAvgHours;
      }
    }
    return sum;
  }, 0);

  return workerTotalHours > 65;
};

const validateWorkerUnderNationalInsuranceMaximum = (thisWorker, myWorkers, csvWorkerSchemaErrors) => {
  if (worksOverNationalInsuranceMaximum(thisWorker, myWorkers)) {
    addOverNationalInsuranceHoursError(csvWorkerSchemaErrors, thisWorker);
  }
};

const addOverNationalInsuranceHoursError = (csvWorkerSchemaErrors, thisWorker) =>
  csvWorkerSchemaErrors.push(exceedsNationalInsuranceMaximum(thisWorker));

const exceedsNationalInsuranceMaximum = (thisWorker) => {
  return {
    origin: 'Workers',
    lineNumber: thisWorker.lineNumber,
    errCode: NI_WORKER_DUPLICATE_ERROR(),
    errType: 'NI_WORKER_DUPLICATE_ERROR',
    error: 'NINUMBER is already associated with another full time worker record',
    source: thisWorker.localId,
    column: 'NINUMBER',
    worker: thisWorker.uniqueWorkerId,
    name: thisWorker.niNumber,
  };
};

module.exports = {
  validateWorkerUnderNationalInsuranceMaximum,
  worksOverNationalInsuranceMaximum,
};
