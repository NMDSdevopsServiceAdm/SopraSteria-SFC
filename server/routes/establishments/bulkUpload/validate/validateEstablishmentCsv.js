'use strict';

const { Establishment } = require('../../../../models/classes/establishment');
const EstablishmentCsvValidator = require('../../../../models/BulkImport/csv/establishments').Establishment;

const validateEstablishmentCsv = async (
  thisLine,
  currentLineNumber,
  csvEstablishmentSchemaErrors,
  myEstablishments,
  myAPIEstablishments,
  myCurrentEstablishments,
  keepAlive = () => {},
) => {
  const lineValidator = new EstablishmentCsvValidator(thisLine, currentLineNumber, myCurrentEstablishments);

  // the parsing/validation needs to be forgiving in that it needs to return as many errors in one pass as possible
  await lineValidator.validate();
  if (!lineValidator._ignore) {
    lineValidator.transform();

    const thisEstablishmentAsAPI = lineValidator.toAPI();

    try {
      const thisApiEstablishment = new Establishment();
      thisApiEstablishment.initialise(
        thisEstablishmentAsAPI.address1,
        thisEstablishmentAsAPI.address2,
        thisEstablishmentAsAPI.address3,
        thisEstablishmentAsAPI.town,
        null,
        thisEstablishmentAsAPI.locationId,
        thisEstablishmentAsAPI.provId,
        thisEstablishmentAsAPI.postcode,
        thisEstablishmentAsAPI.isCQCRegulated,
      );

      await thisApiEstablishment.load(thisEstablishmentAsAPI);

      keepAlive('establishment loaded', currentLineNumber);

      if (thisApiEstablishment.validate()) {
        // No validation errors in the entity itself, so add it ready for completion
        myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
      } else {
        const errors = thisApiEstablishment.errors;

        if (errors.length === 0) {
          myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
        } else {
          // TODO: Remove this when capacities and services are fixed; temporarily adding establishments
          // even though they're in error (because service/capacity validations put all in error)
          myAPIEstablishments[thisApiEstablishment.key] = thisApiEstablishment;
        }
      }
    } catch (err) {
      console.error('WA - localised validate establishment error until validation card', err);

      throw err;
    }
  } else {
    console.log('Ignoring', lineValidator._name);
  }
  // collate all bulk upload validation errors/warnings
  if (lineValidator.validationErrors.length > 0) {
    lineValidator.validationErrors.forEach((thisError) => csvEstablishmentSchemaErrors.push(thisError));
  }
  if (!lineValidator._ignore) {
    myEstablishments.push(lineValidator);
  }
};

module.exports = {
  validateEstablishmentCsv,
};
