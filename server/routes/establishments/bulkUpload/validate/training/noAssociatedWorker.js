const noAssociatedWorker = (record) => {
  return {
    origin: 'Training',
    lineNumber: record.lineNumber,
    errCode: NO_ASSOCIATED_WORKER_ERROR(),
    errType: 'NO_ASSOCIATED_WORKER_ERROR',
    error: 'UNIQUEWORKERID has not been supplied',
    source: record.uniqueWorkerId,
    column: 'UNIQUEWORKERID',
    worker: record.uniqueWorkerId,
    name: record.localId,
  };
};

const NO_ASSOCIATED_WORKER_ERROR = () => 996;

const workerNotFoundInFile = (allWorkersByKey, workerKey) => !allWorkersByKey[workerKey];

const addNoAssociatedWorkerError = (csvSchemaErrors, record) => csvSchemaErrors.push(noAssociatedWorker(record));

module.exports = {
  workerNotFoundInFile,
  addNoAssociatedWorkerError,
};
