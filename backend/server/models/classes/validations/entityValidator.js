/*
 * This is a base class for the entities to manage property validations.
 *
 * A validation is of the format:
 *  {
 *     type: "ERROR | WARNING",
 *     code: 123,
 *     message: "The Date of Birth cannot be after Year of Arrival",
 *     properties: ["DateOfBirth", "YearOfArival"]
 *  }
 */

const ValidationMessage = require('./validationMessage').ValidationMessage;

class EntityValidator {
  constructor() {
      this._validations = [];    
  }

  // the encapsulated property
  get validations() {
      return this._validations;
  }

  // returns only the validation errors
  get errors() {
    return this._validations.filter(thisValidationMsg => thisValidationMsg.type === ValidationMessage.ERROR);
  }
  // returns only the validation warnings
  get warnings() {
    return this._validations.filter(thisValidationMsg => thisValidationMsg.type === ValidationMessage.WARNING);
  }


  // resets the current set of validations
  resetValidations() {
    this._validations = [];
  }

  // to be overridden by entity
  get hasMandatoryProperties() {
    throw new Error('Must be overridden');
  }

  // to be overrideen by entity
  isValid() {
    throw new Error('Must be overridden');
  }

  // validates the given set properties; returns true is all is valid, else false
  validate(properties) {
    // first, validation is performed on the mandatory properties
    const isMandatoryValid = this.hasMandatoryProperties;

    // then each individual property - including any entity local attributes
    const arePropertiesValid = this.isValid();

    return isMandatoryValid && arePropertiesValid;
  }
};

module.exports.EntityValidator = EntityValidator;