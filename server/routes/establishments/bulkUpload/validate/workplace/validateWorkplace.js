const { validateEstablishmentCsv } = require('../validateEstablishmentCsv');
const { keepAlive } = require('../validateBulkUploadFiles');
const { validateDuplicateLocations } = require('../validateDuplicateLocations');

const validateWorkplace = async (establishments, myCurrentEstablishments) => {
  const csvEstablishmentSchemaErrors = [];
  const myEstablishments = [];
  const myAPIEstablishments = {};
  const allEstablishmentsByKey = {};

  if (
    Array.isArray(establishments.imported) &&
    establishments.imported.length > 0 &&
    establishments.metadata.fileType === 'Establishment'
  ) {
    await Promise.all(
      establishments.imported.map((thisLine, currentLineNumber) =>
        validateEstablishmentCsv(
          thisLine,
          currentLineNumber + 2,
          csvEstablishmentSchemaErrors,
          myEstablishments,
          myAPIEstablishments,
          myCurrentEstablishments,
          keepAlive,
        ),
      ),
    );

    checkDuplicate(myEstablishments, csvEstablishmentSchemaErrors, allEstablishmentsByKey, myAPIEstablishments);

    await validateDuplicateLocations(myEstablishments, csvEstablishmentSchemaErrors, myCurrentEstablishments);
    return {
      csvEstablishmentSchemaErrors,
      myEstablishments,
      myAPIEstablishments,
      allEstablishmentsByKey,
    };
  } else {
    console.info('API bulkupload - validateBulkUploadFiles: no establishment records');
  }
};

const checkDuplicate = (
  myEstablishments,
  csvEstablishmentSchemaErrors,
  allEstablishmentsByKey,
  myAPIEstablishments,
) => {
  myEstablishments.forEach((thisEstablishment) => {
    const keyNoWhitespace = thisEstablishment.localId.replace(/\s/g, '');
    if (allEstablishmentsByKey[keyNoWhitespace]) {
      csvEstablishmentSchemaErrors.push(thisEstablishment.addDuplicate(allEstablishmentsByKey[keyNoWhitespace]));

      delete myAPIEstablishments[keyNoWhitespace];
    } else {
      allEstablishmentsByKey[keyNoWhitespace] = thisEstablishment.lineNumber;
    }
  });
};

module.exports = {
  validateWorkplace,
  checkDuplicate,
};
