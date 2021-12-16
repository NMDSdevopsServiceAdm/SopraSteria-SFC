'use strict';

const get = require('lodash/get');

const SALARY_ERROR = () => 1260;

// check if hours matches others in the same job and same annual pay
const validatePartTimeSalary = (thisWorker, myWorkers, myCurrentEstablishments, csvWorkerSchemaErrors) => {
  if (thisWorker.status === 'UNCHECKED' || thisWorker.status === 'DELETE') {
    return;
  }
  if (isPartTimeWorkerAndHasAnnualSalary(thisWorker)) {
    if (fullTimeEquivalentWorkerExistsInFile(thisWorker, myWorkers)) {
      addPartTimeError(csvWorkerSchemaErrors);
    } else {
      const workersToCheckinDB = myWorkers.filter((worker) => worker.status === 'NOCHANGE');

      if (fullTimeEquivalentWorkerExistsInDB(myCurrentEstablishments, workersToCheckinDB, thisWorker)) {
        addPartTimeError(csvWorkerSchemaErrors);
      }
    }
  }
};

const fullTimeEquivalentWorkerExistsInDB = (myCurrentEstablishments, workersToCheckinDB, thisWorker) => {
  if (workersToCheckinDB.length === 0) {
    return false;
  }

  return myCurrentEstablishments.some((establishment) => hasFTEInDB(establishment, workersToCheckinDB, thisWorker));
};

const hasFTEInDB = (establishment, workersToCheckinDB, thisWorker) =>
  workersToCheckinDB.some((localID) => {
    localID = localID.replace(/\s/g, '');
    if (establishment._workerEntities[localID]) {
      const worker = establishment._workerEntities[localID];
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
  parseFloat(thisWorker.hours.contractedHours) < 37 && thisWorker.salary !== '' && thisWorker.salaryInterval === '1';

const fullTimeEquivalentWorkerExistsInFile = (thisWorker, myWorkers) =>
  myWorkers.some(
    (worker) =>
      worker.status !== 'NOCHANGE' &&
      worker.salaryInterval === '1' &&
      worker.salary === thisWorker.salary &&
      worker.mainJob.role === thisWorker.mainJob.role &&
      parseFloat(thisWorker.hours.contractedHours) > 36,
  );

const addPartTimeError = (csvWorkerSchemaErrors) => csvWorkerSchemaErrors.push(ftePayCheckHasDifferentHours());

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
  validatePartTimeSalary,
};
