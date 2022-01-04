const { validateWorkerCsv } = require('./validateWorkerCsv');
const { validateDuplicateWorkerID } = require('./validateDuplicateWorkerID');
const { validatePartTimeSalaryNotEqualToFTE } = require('./validatePartTimeSalaryNotEqualToFTE');
const { validateWorkerUnderNationalInsuranceMaximum } = require('./validateWorkerUnderNationalInsuranceMaximum');

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

    // Start refactoring from here, needs if moving out etc.

    const establishmentKey = thisWorker.localId ? thisWorker.localId.replace(/\s/g, '') : '';

    if (!allEstablishmentsByKey[establishmentKey]) {
      csvWorkerSchemaErrors.push(uncheckedEstablishment(thisWorker));

      delete myAPIWorkers[thisWorker.lineNumber];
    } else {
      // this worker is unique and can be associated to establishment
      allWorkersByKey[workerKey] = thisWorker.lineNumber;

      // associate this worker to the known establishment
      const knownEstablishment = myAPIEstablishments[establishmentKey] ? myAPIEstablishments[establishmentKey] : null;

      // key workers, to be used in training
      workersKeyed[workerKey] = thisWorker._currentLine;

      if (knownEstablishment && myAPIWorkers[thisWorker.lineNumber]) {
        knownEstablishment.associateWorker(
          myAPIWorkers[thisWorker.lineNumber].key,
          myAPIWorkers[thisWorker.lineNumber],
        );
      } else {
        // this should never happen
        console.error(
          `FATAL: failed to associate worker (line number: ${thisWorker.lineNumber}/unique id (${thisWorker.uniqueWorkerId})) with a known establishment.`,
        );
      }
    }
  });

  workers.metadata.records = myWorkers.length;

  return { csvWorkerSchemaErrors, myAPIWorkers, workersKeyed, allWorkersByKey, myJSONWorkers };
};

const createKeysForWorkers = (workers) => {
  return workers.map((worker) => {
    return createWorkerKey(worker.local, worker.uniqueWorker);
  });
};

const createWorkerKey = (localEstablishmentId, workerId) => {
  return (localEstablishmentId + workerId).replace(/\s/g, '');
};

const uncheckedEstablishment = (thisWorker) => {
  return {
    origin: 'Workers',
    lineNumber: thisWorker.lineNumber,
    errCode: UNCHECKED_ESTABLISHMENT_ERROR(),
    errType: 'UNCHECKED_ESTABLISHMENT_ERROR',
    error: 'LOCALESTID does not exist in Workplace file',
    source: thisWorker.localId,
    column: 'LOCALESTID',
    worker: thisWorker.uniqueWorkerId,
    name: thisWorker.localId,
  };
};

const UNCHECKED_ESTABLISHMENT_ERROR = () => 997;

module.exports = {
  validateWorkers,
  createKeysForWorkers,
  createWorkerKey,
};
