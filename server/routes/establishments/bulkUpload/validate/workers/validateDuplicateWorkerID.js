'use strict';

const validateDuplicateWorkerID = (
  thisWorker,
  allKeys,
  keyNoWhitespace,
  allWorkersByKey,
  myAPIWorkers,
  csvWorkerSchemaErrors,
) => {
  if (isDuplicate(allWorkersByKey, keyNoWhitespace, thisWorker, allKeys)) {
    csvWorkerSchemaErrors.push(addDuplicate(thisWorker));

    delete myAPIWorkers[thisWorker.lineNumber];
    return false;
  }
  return true;
};

const DUPLICATE_ERROR = () => 998;

const addDuplicate = (thisWorker) => {
  const workerIDText = thisWorker.changeUniqueWorker ? 'CHGUNIQUEWRKID' : 'UNIQUEWORKERID';
  const workerID = thisWorker.changeUniqueWorker ? thisWorker.changeUniqueWorker : thisWorker.uniqueWorkerId;

  return {
    origin: 'Workers',
    lineNumber: thisWorker.lineNumber,
    errCode: DUPLICATE_ERROR(),
    errType: 'DUPLICATE_ERROR',
    error: `${workerIDText} ${workerID} is not unique`,
    source: thisWorker.uniqueWorkerId,
    column: workerIDText,
    worker: thisWorker.uniqueWorkerId,
    name: thisWorker.localId,
  };
};

const isDuplicate = (allWorkersByKey, keyNoWhitespace, thisWorker, allKeys) =>
  allWorkersByKey[keyNoWhitespace] || (thisWorker.changeUniqueWorker && allKeys.includes(keyNoWhitespace));

module.exports = {
  validateDuplicateWorkerID,
};
