exports.createWorkerKey = (localEstablishmentId, workerId) =>
  ((localEstablishmentId || '') + (workerId || '')).replace(/\s/g, '');

exports.deleteRecord = (APIRecords, lineNumber) => delete APIRecords[lineNumber];

exports.csvQuote = (toCsv) => {
  if (toCsv && toCsv.replace(/ /g, '').match(/[\s,"]/)) {
    return '"' + toCsv.replace(/"/g, '""') + '"';
  }

  return toCsv;
};
