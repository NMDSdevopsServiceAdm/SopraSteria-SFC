exports.createWorkerKey = (localEstablishmentId, workerId) => {
  return ((localEstablishmentId || '') + (workerId || '')).replace(/\s/g, '');
};

exports.deleteRecord = (APIRecords, lineNumber) => delete APIRecords[lineNumber];
