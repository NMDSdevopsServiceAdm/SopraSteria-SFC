const { validateEstablishmentCsv } = require('../validateEstablishmentCsv');
const { keepAlive } = require('../validateBulkUploadFiles');
const { validateDuplicateLocations } = require('../validateDuplicateLocations');

const validateWorkplace = async (
  establishments,
  allEstablishmentsByKey,
  myAPIEstablishments,
  myCurrentEstablishments,
) => {
  const csvEstablishmentSchemaErrors = [];

  const myEstablishments = [];

  if (
    Array.isArray(establishments.imported) &&
    establishments.imported.length > 0 &&
    establishments.metadata.fileType === 'Establishment'
  ) {
    // validate all establishment rows
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

    // having parsed all establishments, check for duplicates
    // the easiest way to check for duplicates is to build a single object, with the establishment key 'LOCALESTID` as property name
    myEstablishments.forEach((thisEstablishment) => {
      const keyNoWhitespace = thisEstablishment.localId.replace(/\s/g, '');
      if (allEstablishmentsByKey[keyNoWhitespace]) {
        // this establishment is a duplicate
        csvEstablishmentSchemaErrors.push(thisEstablishment.addDuplicate(allEstablishmentsByKey[keyNoWhitespace]));

        // remove the entity
        delete myAPIEstablishments[keyNoWhitespace];
      } else {
        // does not yet exist
        allEstablishmentsByKey[keyNoWhitespace] = thisEstablishment.lineNumber;
      }
    });

    await validateDuplicateLocations(myEstablishments, csvEstablishmentSchemaErrors, myCurrentEstablishments);
    return {
      csvEstablishmentSchemaErrors,
      myEstablishments,
    };
  } else {
    console.info('API bulkupload - validateBulkUploadFiles: no establishment records');
  }
};

module.exports.validateWorkplace = validateWorkplace;
