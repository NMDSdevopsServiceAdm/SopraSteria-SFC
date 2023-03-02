const moment = require('moment');

const BUDI = require('../classes/BUDI').BUDI;
const errors = require('../validateTraining/errors');

class TrainingCsvValidator {
  constructor(currentLine, lineNumber, mappings) {
    this.currentLine = currentLine;
    this.lineNumber = lineNumber;
    this.validationErrors = [];
    this.localeStId = null;
    this.uniqueWorkerId = null;
    this.dateCompleted = null;
    this.expiry = null;
    this.description = null;
    this.category = null;
    this.accredited = null;
    this.notes = null;

    this.BUDI = new BUDI(mappings);
  }

  static get LOCALESTID_ERROR() {
    return 1000;
  }
  static get UNIQUE_WORKER_ID_ERROR() {
    return 1010;
  }
  static get DATE_COMPLETED_ERROR() {
    return 1020;
  }
  static get EXPIRY_DATE_ERROR() {
    return 1030;
  }
  static get DESCRIPTION_ERROR() {
    return 1040;
  }
  static get CATEGORY_ERROR() {
    return 1050;
  }
  static get ACCREDITED_ERROR() {
    return 1060;
  }
  static get NOTES_ERROR() {
    return 1070;
  }
  static get DATE_COMPLETED_WARNING() {
    return 2020;
  }
  static get EXPIRY_DATE_WARNING() {
    return 2030;
  }
  static get DESCRIPTION_WARNING() {
    return 2040;
  }
  static get CATEGORY_WARNING() {
    return 2050;
  }
  static get ACCREDITED_WARNING() {
    return 2060;
  }
  static get NOTES_WARNING() {
    return 2070;
  }

  validate() {
    this._validateLocaleStId();
    this._validateUniqueWorkerId();
    this._validateDateCompleted();
    this._validateExpiry();
    this._validateDescription();
    this._validateCategory();
    this._validateAccredited();
    this._validateNotes();
  }

  toJSON() {
    return {
      localId: this.localeStId,
      uniqueWorkerId: this.uniqueWorkerId,
      completed: this.dateCompleted ? this.dateCompleted.format('DD/MM/YYYY') : undefined,
      expiry: this.expiry ? this.expiry.format('DD/MM/YYYY') : undefined,
      description: this.description,
      category: this.category,
      accredited: this.accredited,
      notes: this.notes,
      lineNumber: this.lineNumber,
    };
  }

  toAPI() {
    const changeProperties = {
      trainingCategory: {
        id: this.category,
      },
      completed: this.dateCompleted ? this.dateCompleted.format('YYYY-MM-DD') : undefined,
      expires: this.expiry ? this.expiry.format('YYYY-MM-DD') : undefined,
      title: this.description ? this.description : undefined,
      notes: this.notes ? this.notes : undefined,
      accredited: this.accredited ? this.accredited : undefined,
    };

    return changeProperties;
  }

  _validateLocaleStId() {
    const localeStId = this.currentLine.LOCALESTID;
    const MAX_LENGTH = 50;
    const errMessage = errors._getValidateLocaleStIdErrMessage(localeStId, MAX_LENGTH);
    if (!errMessage) {
      this.localeStId = localeStId;
      return;
    }
    this._addValidationError('LOCALESTID_ERROR', errMessage, this.currentLine.LOCALESTID, 'LOCALESTID');
  }

  _validateUniqueWorkerId() {
    const uniqueId = this.currentLine.UNIQUEWORKERID;
    const MAX_LENGTH = 50;
    const errMessage = errors._getValidateUniqueWorkerIdErrMessage(uniqueId, MAX_LENGTH);
    if (!errMessage) {
      this.uniqueWorkerId = uniqueId;
      return;
    }
    this._addValidationError('UNIQUE_WORKER_ID_ERROR', errMessage, this.currentLine.UNIQUEWORKERID, 'UNIQUEWORKERID');
  }

  _validateDateCompleted() {
    if (!this.currentLine.DATECOMPLETED) {
      this.dateCompleted = this.currentLine.DATECOMPLETED;
      return;
    }

    const dateCompleted = moment.utc(this.currentLine.DATECOMPLETED, 'DD/MM/YYYY', true);
    const errMessage = errors._getValidateDateCompletedErrMessage(dateCompleted);

    if (!errMessage) {
      this.dateCompleted = dateCompleted;
      return;
    }
    this._addValidationError('DATE_COMPLETED_ERROR', errMessage, this.currentLine.DATECOMPLETED, 'DATECOMPLETED');
  }

  _validateExpiry() {
    if (!this.currentLine.EXPIRYDATE) {
      this.expiry = this.currentLine.EXPIRYDATE;
      return;
    }

    const expiredDate = moment.utc(this.currentLine.EXPIRYDATE, 'DD/MM/YYYY', true);
    const validationErrorDetails = errors._getValidateExpiryErrDetails(expiredDate, this.dateCompleted);

    if (!validationErrorDetails) {
      this.expiry = expiredDate;
      return;
    }

    this._addValidationError(
      'EXPIRY_DATE_ERROR',
      validationErrorDetails.errMessage,
      this.currentLine.EXPIRYDATE,
      validationErrorDetails.errColumnName,
    );
  }

  _validateDescription() {
    const description = this.currentLine.DESCRIPTION;
    const MAX_LENGTH = 120;
    const errMessage = errors._getValidateDescriptionErrMessage(description, MAX_LENGTH);
    if (!errMessage) {
      this.description = description;
      return;
    }
    this._addValidationError('DESCRIPTION_ERROR', errMessage, this.currentLine.DESCRIPTION, 'DESCRIPTION');
  }

  _validateCategory() {
    const category = parseInt(this.currentLine.CATEGORY, 10);

    if (Number.isNaN(category) || this.BUDI.trainingCategory(this.BUDI.TO_ASC, category) === null) {
      this._addValidationError(
        'CATEGORY_ERROR',
        'CATEGORY has not been supplied',
        this.currentLine.CATEGORY,
        'CATEGORY',
      );
      return;
    }
    this.category = this.BUDI.trainingCategory(this.BUDI.TO_ASC, category);
  }

  _validateAccredited() {
    if (this.currentLine.ACCREDITED) {
      const accredited = parseInt(this.currentLine.ACCREDITED, 10);
      const ALLOWED_VALUES = [0, 1, 999];

      if (Number.isNaN(accredited) || !ALLOWED_VALUES.includes(accredited)) {
        this._addValidationError(
          'ACCREDITED_ERROR',
          'ACCREDITED is invalid',
          this.currentLine.ACCREDITED,
          'ACCREDITED',
        );
        return;
      }

      this.accredited = this._convertAccreditedValue(accredited);
    }
  }

  _convertAccreditedValue(key) {
    const accreditedValues = {
      0: 'No',
      1: 'Yes',
      999: "Don't know",
    };

    return accreditedValues[key] || '';
  }

  _validateNotes() {
    const notes = this.currentLine.NOTES;
    const MAX_LENGTH = 1000;

    if (notes) {
      if (notes.length > MAX_LENGTH) {
        this._addValidationError(
          'NOTES_ERROR',
          `NOTES is longer than ${MAX_LENGTH} characters`,
          this.currentLine.NOTES,
          'NOTES',
        );
        return;
      }

      this.notes = notes;
    }
  }

  _addValidationError(errorType, errorMessage, errorSource, columnName) {
    this.validationErrors.push({
      origin: 'Training',
      worker: this.currentLine.UNIQUEWORKERID,
      name: this.currentLine.LOCALESTID,
      lineNumber: this.lineNumber,
      errCode: TrainingCsvValidator[errorType],
      errType: errorType,
      error: errorMessage,
      source: errorSource,
      column: columnName,
    });
  }
}

module.exports.TrainingCsvValidator = TrainingCsvValidator;
