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

    const establishmentKey = thisWorker.localId ? thisWorker.localId.replace(/\s/g, '') : '';

    if (establishmentNotFoundInFile(allEstablishmentsByKey, establishmentKey)) {
      addNoEstablishmentError(csvWorkerSchemaErrors, thisWorker);
      deleteWorker(myAPIWorkers, thisWorker.lineNumber);
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

const establishmentNotFoundInFile = (allEstablishmentsByKey, establishmentKey) =>
  !allEstablishmentsByKey[establishmentKey];

const addNoEstablishmentError = (csvWorkerSchemaErrors, thisWorker) =>
  csvWorkerSchemaErrors.push(uncheckedEstablishment(thisWorker));

const deleteWorker = (myAPIWorkers, workerLineNumber) => delete myAPIWorkers[workerLineNumber];

module.exports = {
  validateWorkers,
  createKeysForWorkers,
  createWorkerKey,
  establishmentNotFoundInFile,
  addNoEstablishmentError,
  deleteWorker,
};
