const noAssociatedEstablishment = (record, origin) => {
  return {
    origin,
    lineNumber: record.lineNumber,
    errCode: NO_ASSOCIATED_ESTABLISHMENT_ERROR(),
    errType: 'NO_ASSOCIATED_ESTABLISHMENT_ERROR',
    error: 'LOCALESTID does not exist in Workplace file',
    source: record.localId,
    column: 'LOCALESTID',
    worker: record.uniqueWorkerId,
    name: record.localId,
  };
};

const NO_ASSOCIATED_ESTABLISHMENT_ERROR = () => 997;

const establishmentNotFoundInFile = (allEstablishmentsByKey, establishmentKey) =>
  !allEstablishmentsByKey[establishmentKey];

const addNoAssociatedEstablishmentError = (csvSchemaErrors, record, origin) =>
  csvSchemaErrors.push(noAssociatedEstablishment(record, origin));

module.exports = {
  establishmentNotFoundInFile,
  addNoAssociatedEstablishmentError,
};
