exports.dateFormatter = (dateOfBirth) => {
  const dobParts = dateOfBirth ? dateOfBirth.split('-') : null;
  return dobParts ? `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}` : '';
};

exports.createWorkerKey = (localEstablishmentId, workerId) =>
  ((localEstablishmentId || '') + (workerId || '')).replace(/\s/g, '');

exports.createEstablishmentKey = (establishmentId) => (establishmentId ? establishmentId.replace(/\s/g, '') : '');

exports.deleteRecord = (APIRecords, lineNumber) => delete APIRecords[lineNumber];

exports.csvQuote = (toCsv) => {
  if (toCsv && toCsv.replace(/ /g, '').match(/[\s,"]/)) {
    return '"' + toCsv.replace(/"/g, '""') + '"';
  }

  return toCsv;
};
