'use strict';

const get = require('lodash/get');

const SALARY_ERROR = () => 1260;

const validatePartTimeSalaryNotEqualToFTE = (thisWorker, myWorkers, myCurrentEstablishments, csvWorkerSchemaErrors) => {
  if (thisWorker.status === 'UNCHECKED' || thisWorker.status === 'DELETE') {
    return;
  }
  if (
    isPartTimeWorkerAndHasAnnualSalary(thisWorker) &&
    fullTimeEquivalentExists(thisWorker, myWorkers, myCurrentEstablishments)
  ) {
    addPartTimeError(csvWorkerSchemaErrors, thisWorker);
  }
};

const fullTimeEquivalentExists = (thisWorker, myWorkers, myCurrentEstablishments) => {
  const workersToCheckinDB = myWorkers.filter((worker) => isSavingWorker(worker.status));

  return (
    fullTimeEquivalentWorkerExistsInFile(thisWorker, myWorkers) ||
    fullTimeEquivalentWorkerExistsInDB(myCurrentEstablishments, workersToCheckinDB, thisWorker)
  );
};

const fullTimeEquivalentWorkerExistsInDB = (myCurrentEstablishments, workersToCheckinDB, thisWorker) => {
  if (workersToCheckinDB.length === 0) {
    return false;
  }

  return myCurrentEstablishments.some((establishment) => hasFTEInDB(establishment, workersToCheckinDB, thisWorker));
};

const hasFTEInDB = (establishment, workersToCheckinDB, thisWorker) =>
  workersToCheckinDB.some(({ uniqueWorkerId }) => {
    const workerIDNoSpaces = uniqueWorkerId.replace(/\s/g, '');
    if (establishment._workerEntities[workerIDNoSpaces]) {
      const worker = establishment._workerEntities[workerIDNoSpaces];
      if (workerIsFullTimeEquivalent(worker, thisWorker)) {
        return true;
      }
    }
  });

const workerIsFullTimeEquivalent = (worker, thisWorker) =>
  get(worker, 'annualHourlyPay.value') === 'Annually' &&
  get(worker, 'annualHourlyPay.rate') == thisWorker.salary &&
  worker.mainJob.jobId == thisWorker.mainJob.role &&
  parseFloat(get(worker, 'contractedHours.hours')) > 36;

const isPartTimeWorkerAndHasAnnualSalary = (thisWorker) =>
  parseFloat(thisWorker.hours.contractedHours) < 37 &&
  thisWorker.salary !== '' &&
  thisWorker.salaryInterval === 'Annually';

const fullTimeEquivalentWorkerExistsInFile = (thisWorker, myWorkers) =>
  myWorkers.some(
    (worker) =>
      isSavingWorker(worker.status, true) &&
      worker.salaryInterval === 'Annually' &&
      worker.salary === thisWorker.salary &&
      worker.mainJob.role === thisWorker.mainJob.role &&
      parseFloat(worker.hours.contractedHours) > 36,
  );

const isSavingWorker = (status, includeDelete = false) => {
  const notSavedStatuses = ['NOCHANGE', 'UNCHECKED'];
  if (includeDelete) {
    notSavedStatuses.push('DELETE');
  }
  return !notSavedStatuses.includes(status);
};

const addPartTimeError = (csvWorkerSchemaErrors, thisWorker) =>
  csvWorkerSchemaErrors.push(ftePayCheckHasDifferentHours(thisWorker));

const ftePayCheckHasDifferentHours = (thisWorker) => {
  return {
    origin: 'Workers',
    lineNumber: thisWorker.lineNumber,
    warnCode: SALARY_ERROR(),
    warnType: 'SALARY_ERROR',
    warning:
      'SALARY is the same as other staff on different hours. Please check you have not entered full time equivalent (FTE) pay',
    source: thisWorker.localId,
    column: 'SALARY',
    worker: thisWorker.uniqueWorkerId,
    name: thisWorker.localId,
  };
};

module.exports = {
  validatePartTimeSalaryNotEqualToFTE,
  isSavingWorker,
};
