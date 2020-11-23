'use strict';

const validateDuplicateWorkerID = (
  thisWorker,
  allKeys,
  changeKeyNoWhitespace,
  keyNoWhitespace,
  allWorkersByKey,
  myAPIWorkers,
  csvWorkerSchemaErrors,
) => {
  // the worker will be known by LOCALSTID and UNIQUEWORKERID, but if CHGUNIQUEWORKERID is given, then it's combination of LOCALESTID and CHGUNIQUEWORKERID must be unique
  if (changeKeyNoWhitespace && (allWorkersByKey[changeKeyNoWhitespace] || allKeys.includes(changeKeyNoWhitespace))) {
    // this worker is a duplicate
    csvWorkerSchemaErrors.push(thisWorker.addChgDuplicate(thisWorker.changeUniqueWorker));

    // remove the entity
    delete myAPIWorkers[thisWorker.lineNumber];
    return false;
  } else if (allWorkersByKey[keyNoWhitespace] !== undefined) {
    // this worker is a duplicate
    csvWorkerSchemaErrors.push(thisWorker.addDuplicate(thisWorker.uniqueWorker));

    // remove the entity
    delete myAPIWorkers[thisWorker.lineNumber];
    return false;
  } else {
    return true;
  }
};

module.exports = {
  validateDuplicateWorkerID,
};
