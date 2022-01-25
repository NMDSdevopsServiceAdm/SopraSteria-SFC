const uncheckedWorker = (record) => {
  return {
    origin: 'Workers',
    lineNumber: record.lineNumber,
    errCode: UNCHECKED_WORKER_ERROR(),
    errType: 'UNCHECKED_WORKER_ERROR',
    error: 'UNIQUEWORKERID has not been supplied',
    source: record.uniqueWorkerId,
    column: 'UNIQUEWORKERID',
    worker: record.uniqueWorkerId,
    name: record.localId,
  };
};

const UNCHECKED_WORKER_ERROR = () => 996;

const workerNotFoundInFile = (allWorkersByKey, workerKey) => !allWorkersByKey[workerKey];

const addNoWorkerError = (csvSchemaErrors, record) => csvSchemaErrors.push(uncheckedWorker(record));

module.exports = {
  workerNotFoundInFile,
  addNoWorkerError,
};
