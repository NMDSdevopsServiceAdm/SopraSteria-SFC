exports.createWorkerKey = (localEstablishmentId, workerId) =>
  ((localEstablishmentId || '') + (workerId || '')).replace(/\s/g, '');

exports.deleteRecord = (APIRecords, lineNumber) => delete APIRecords[lineNumber];
