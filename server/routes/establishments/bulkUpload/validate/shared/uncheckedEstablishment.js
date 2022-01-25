const uncheckedEstablishment = (record, origin) => {
  return {
    origin,
    lineNumber: record.lineNumber,
    errCode: UNCHECKED_ESTABLISHMENT_ERROR(),
    errType: 'UNCHECKED_ESTABLISHMENT_ERROR',
    error: 'LOCALESTID does not exist in Workplace file',
    source: record.localId,
    column: 'LOCALESTID',
    worker: record.uniqueWorkerId,
    name: record.localId,
  };
};

const UNCHECKED_ESTABLISHMENT_ERROR = () => 997;

const establishmentNotFoundInFile = (allEstablishmentsByKey, establishmentKey) =>
  !allEstablishmentsByKey[establishmentKey];

const addNoEstablishmentError = (csvSchemaErrors, record, origin) =>
  csvSchemaErrors.push(uncheckedEstablishment(record, origin));

module.exports = {
  establishmentNotFoundInFile,
  addNoEstablishmentError,
};
