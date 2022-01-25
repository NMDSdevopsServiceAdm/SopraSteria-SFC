const { validateWorkerCsv } = require('./validateWorkerCsv');
const { validateDuplicateWorkerID } = require('./validateDuplicateWorkerID');
const { validatePartTimeSalaryNotEqualToFTE } = require('./validatePartTimeSalaryNotEqualToFTE');
const { validateWorkerUnderNationalInsuranceMaximum } = require('./validateWorkerUnderNationalInsuranceMaximum');
const { establishmentNotFoundInFile, addNoEstablishmentError } = require('../shared/uncheckedEstablishment');
const { createWorkerKey, deleteRecord } = require('../shared/utils');

const validateWorkers = async (workers, myCurrentEstablishments, allEstablishmentsByKey, myAPIEstablishments) => {
  const workersKeyed = [];
  const allWorkersByKey = {};

  const { csvWorkerSchemaErrors, myAPIWorkers, myJSONWorkers } = await validateWorkerCsv(
    workers,
    myCurrentEstablishments,
  );

  console.info('Workers validated');

  // used to check for duplicates
  const allWorkerKeys = createKeysForWorkers(myJSONWorkers);

  myJSONWorkers.forEach((thisWorker) => {
    validatePartTimeSalaryNotEqualToFTE(thisWorker, myJSONWorkers, myCurrentEstablishments, csvWorkerSchemaErrors);
    validateWorkerUnderNationalInsuranceMaximum(thisWorker, myJSONWorkers, csvWorkerSchemaErrors);

    const workerKey = thisWorker.changeUniqueWorker
      ? createWorkerKey(thisWorker.localId, thisWorker.changeUniqueWorker)
      : createWorkerKey(thisWorker.localId, thisWorker.uniqueWorkerId);

    const isNotDuplicateWorker = validateDuplicateWorkerID(
      thisWorker,
      allWorkerKeys,
      workerKey,
      allWorkersByKey,
      myAPIWorkers,
      csvWorkerSchemaErrors,
    );

    if (!isNotDuplicateWorker) {
      return;
    }

    const establishmentKey = thisWorker.localId ? thisWorker.localId.replace(/\s/g, '') : '';

    if (establishmentNotFoundInFile(allEstablishmentsByKey, establishmentKey)) {
      addNoEstablishmentError(csvWorkerSchemaErrors, thisWorker, 'Worker');
      deleteRecord(myAPIWorkers, thisWorker.lineNumber);
      return;
    }

    allWorkersByKey[workerKey] = thisWorker.lineNumber;
    workersKeyed[workerKey] = thisWorker._currentLine;

    associateWorkerWithEstablishment(myAPIEstablishments, establishmentKey, myAPIWorkers, thisWorker);
  });

  workers.metadata.records = myJSONWorkers.length;

  return { csvWorkerSchemaErrors, myAPIWorkers, workersKeyed, allWorkersByKey, myJSONWorkers };
};

const associateWorkerWithEstablishment = (myAPIEstablishments, establishmentKey, myAPIWorkers, thisWorker) => {
  const knownEstablishment = myAPIEstablishments[establishmentKey];

  if (knownEstablishment && myAPIWorkers[thisWorker.lineNumber]) {
    knownEstablishment.associateWorker(myAPIWorkers[thisWorker.lineNumber].key, myAPIWorkers[thisWorker.lineNumber]);
  } else {
    console.error(
      `FATAL: failed to associate worker (line number: ${thisWorker.lineNumber}/unique id (${thisWorker.uniqueWorkerId})) with a known establishment.`,
    );
  }
};

const createKeysForWorkers = (myJSONWorkers) => {
  return myJSONWorkers.map((worker) => {
    return createWorkerKey(worker.localId, worker.uniqueWorkerId);
  });
};

module.exports = {
  validateWorkers,
  createKeysForWorkers,
};
