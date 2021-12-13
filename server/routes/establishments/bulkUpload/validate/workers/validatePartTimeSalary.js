'use strict';

const BUDI = require('../../../../../models/BulkImport/BUDI').BUDI;

// check if hours matches others in the same job and same annual pay
const validatePartTimeSalary = (thisWorker, myWorkers, myCurrentEstablishments, csvWorkerSchemaErrors) => {
  if (thisWorker._currentLine.STATUS === 'UNCHECKED' || thisWorker._currentLine.STATUS === 'DELETE') {
    return;
  }
  if (
    thisWorker._currentLine.CONTHOURS !== '' &&
    parseFloat(thisWorker._currentLine.CONTHOURS) < 37 &&
    thisWorker._currentLine.SALARY !== '' &&
    thisWorker._currentLine.SALARYINT === '1'
  ) {
    let workersToCheckinDB = [];
    let otherWorkerFTE = myWorkers.some(function (worker) {
      if (
        worker._currentLine.STATUS !== 'DELETE' &&
        worker._currentLine.STATUS !== 'UNCHECKED' &&
        worker._currentLine.STATUS !== 'NOCHANGE' &&
        worker._currentLine.SALARYINT === '1' &&
        worker._currentLine.SALARY === thisWorker._currentLine.SALARY &&
        worker._currentLine.MAINJOBROLE === thisWorker._currentLine.MAINJOBROLE &&
        parseFloat(worker._currentLine.CONTHOURS) > 36
      ) {
        return true;
      } else if (worker._currentLine.STATUS === 'UNCHECKED' || worker._currentLine.STATUS === 'NOCHANGE') {
        workersToCheckinDB.push(worker._currentLine.UNIQUEWORKERID);
      }
    });

    if (otherWorkerFTE) {
      csvWorkerSchemaErrors.push(thisWorker.ftePayCheckHasDifferentHours());
    } else if (workersToCheckinDB.length) {
      if (
        myCurrentEstablishments.some(function (establishment) {
          return workersToCheckinDB.some(function (localID) {
            localID = localID.replace(/\s/g, '');
            if (establishment._workerEntities[localID]) {
              const worker = establishment._workerEntities[localID];
              if (
                worker.annualHourlyPay &&
                worker.annualHourlyPay.value === 'Annually' &&
                worker.annualHourlyPay.rate == thisWorker._currentLine.SALARY &&
                worker.mainJob
              ) {
                const mappedRole = BUDI.jobRoles(BUDI.TO_ASC, parseInt(thisWorker._currentLine.MAINJOBROLE));
                if (
                  worker.mainJob.jobId == mappedRole &&
                  worker.contractedHours &&
                  parseFloat(worker.contractedHours.hours) > 36
                ) {
                  return true;
                }
              }
            }
          });
        })
      ) {
        csvWorkerSchemaErrors.push(thisWorker.ftePayCheckHasDifferentHours());
      }
    }
  }
};

module.exports = {
  validatePartTimeSalary,
};
