const moment = require('moment');

const BUDI = require('../classes/BUDI').BUDI;

class TrainingCsvValidator {
  constructor(currentLine, lineNumber, mappings) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._validationErrors = [];

    this._localeStId = null;
    this._uniqueWorkerId = null;
    this._dateCompleted = null;
    this._expiry = null;
    this._description = null;
    this._category = null;
    this._accredited = null;
    this._notes = null;

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

  get lineNumber() {
    return this._lineNumber;
  }

  get currentLine() {
    return this._currentLine;
  }

  get localeStId() {
    return this._localeStId;
  }

  get uniqueWorkerId() {
    return this._uniqueWorkerId;
  }

  get completed() {
    return this._dateCompleted;
  }

  get expiry() {
    return this._expiry;
  }

  get description() {
    return this._description;
  }

  get category() {
    return this._category;
  }

  get accredited() {
    return this._accredited;
  }

  get notes() {
    return this._notes;
  }

  validate() {
    let status = true;
    status = !this._validateLocaleStId() ? false : status;
    status = !this._validateUniqueWorkerId() ? false : status;
    status = !this._validateDateCompleted() ? false : status;
    status = !this._validateExpiry() ? false : status;
    status = !this._validateDescription() ? false : status;
    status = !this._validateCategory() ? false : status;
    status = !this._validateAccredited() ? false : status;
    status = !this._validateNotes() ? false : status;

    return status;
  }

  toJSON() {
    return {
      localId: this._localeStId,
      uniqueWorkerId: this._uniqueWorkerId,
      completed: this._dateCompleted ? this._dateCompleted.format('DD/MM/YYYY') : undefined,
      expiry: this._expiry ? this._expiry.format('DD/MM/YYYY') : undefined,
      description: this._description,
      category: this._category,
      accredited: this._accredited,
      notes: this._notes,
      lineNumber: this._lineNumber,
    };
  }

  toAPI() {
    const changeProperties = {
      trainingCategory: {
        id: this._category,
      },
      completed: this._dateCompleted ? this._dateCompleted.format('YYYY-MM-DD') : undefined,
      expires: this._expiry ? this._expiry.format('YYYY-MM-DD') : undefined,
      title: this._description ? this._description : undefined,
      notes: this._notes ? this._notes : undefined,
      accredited: this._accredited ? this._accredited : undefined,
    };

    return changeProperties;
  }

  _validateLocaleStId() {
    const myLocaleStId = this._currentLine.LOCALESTID;
    const MAX_LENGTH = 50;
    const errMessage = this._getValidateLocaleStIdErrMessage(myLocaleStId, MAX_LENGTH);
    if (!errMessage) {
      this._localeStId = myLocaleStId;
      return;
    }
    this._addValidationError('LOCALESTID_ERROR', errMessage, this._currentLine.LOCALESTID, 'LOCALESTID');
  }

  _getValidateLocaleStIdErrMessage(myLocaleStId, MAX_LENGTH) {
    if (!myLocaleStId || myLocaleStId.length === 0) {
      return 'LOCALESTID has not been supplied';
    } else if (myLocaleStId.length > MAX_LENGTH) {
      return `LOCALESTID is longer than ${MAX_LENGTH} characters`;
    }
    return;
  }

  _validateUniqueWorkerId() {
    const myUniqueId = this._currentLine.UNIQUEWORKERID;
    const MAX_LENGTH = 50;
    const errMessage = this._getValidateUniqueWorkerIdErrMessage(myUniqueId, MAX_LENGTH);
    if (!errMessage) {
      this._uniqueWorkerId = myUniqueId;
      return;
    }
    this._addValidationError('UNIQUE_WORKER_ID_ERROR', errMessage, this._currentLine.UNIQUEWORKERID, 'UNIQUEWORKERID');
  }

  _getValidateUniqueWorkerIdErrMessage(myUniqueId, MAX_LENGTH) {
    if (!myUniqueId || myUniqueId.length === 0) {
      return 'UNIQUEWORKERID has not been supplied';
    } else if (myUniqueId.length > MAX_LENGTH) {
      return `UNIQUEWORKERID is longer than ${MAX_LENGTH} characters`;
    }
    return;
  }

  _validateDateCompleted() {
    if (this._checkForEmptyOrNullDate(this._currentLine.DATECOMPLETED)) {
      this._dateCompleted = this._currentLine.DATECOMPLETED;
      return;
    }

    const dateCompleted = moment.utc(this._currentLine.DATECOMPLETED, 'DD/MM/YYYY', true);
    const errMessage = this._getValidateDateCompletedErrMessage(dateCompleted);

    if (!errMessage) {
      this._dateCompleted = dateCompleted;
      return;
    }
    this._addValidationError('DATE_COMPLETED_ERROR', errMessage, this._currentLine.DATECOMPLETED, 'DATECOMPLETED');
  }

  _getValidateDateCompletedErrMessage(dateCompleted) {
    if (!dateCompleted.isValid()) {
      return 'DATECOMPLETED is incorrectly formatted';
    } else if (dateCompleted.isAfter(moment())) {
      return 'DATECOMPLETED is in the future';
    }
    return;
  }

  _validateExpiry() {
    if (this._checkForEmptyOrNullDate(this._currentLine.EXPIRYDATE)) {
      this._expiry = this._currentLine.EXPIRYDATE;
      return;
    }

    const expiredDate = moment.utc(this._currentLine.EXPIRYDATE, 'DD/MM/YYYY', true);
    const validationErrorDetails = this._getValidateExpiryErrDetails(expiredDate);

    if (!validationErrorDetails) {
      this._expiry = expiredDate;
      return;
    }

    this._addValidationError(
      'EXPIRY_DATE_ERROR',
      validationErrorDetails.errMessage,
      this._currentLine.EXPIRYDATE,
      validationErrorDetails.errColumnName,
    );
  }

  _getValidateExpiryErrDetails(expiredDate) {
    if (!expiredDate.isValid()) {
      return { errMessage: 'EXPIRYDATE is incorrectly formatted', errColumnName: 'EXPIRYDATE' };
    } else if (expiredDate.isSameOrBefore(this._dateCompleted, 'day')) {
      return { errMessage: 'EXPIRYDATE must be after DATECOMPLETED', errColumnName: 'EXPIRYDATE/DATECOMPLETED' };
    }
    return;
  }

  _validateDescription() {
    const myDescription = this._currentLine.DESCRIPTION;
    const MAX_LENGTH = 120;
    const errMessage = this._getValidateDescriptionErrMessage(myDescription, MAX_LENGTH);

    if (!errMessage) {
      this._description = myDescription;
      return;
    }
    this._addValidationError('DESCRIPTION_ERROR', errMessage, this._currentLine.DESCRIPTION, 'DESCRIPTION');
  }

  _getValidateDescriptionErrMessage(myDescription, MAX_LENGTH) {
    if (!myDescription || myDescription.length === 0) {
      return 'DESCRIPTION has not been supplied';
    } else if (myDescription.length > MAX_LENGTH) {
      return `DESCRIPTION is longer than ${MAX_LENGTH} characters`;
    }
    return;
  }

  _validateCategory() {
    const category = parseInt(this._currentLine.CATEGORY, 10);

    if (Number.isNaN(category) || this.BUDI.trainingCategory(this.BUDI.TO_ASC, category) === null) {
      this._addValidationError(
        'CATEGORY_ERROR',
        'CATEGORY has not been supplied',
        this._currentLine.CATEGORY,
        'CATEGORY',
      );
      return;
    }
    this._category = this.BUDI.trainingCategory(this.BUDI.TO_ASC, category);
  }

  _validateAccredited() {
    if (this._currentLine.ACCREDITED) {
      const accredited = parseInt(this._currentLine.ACCREDITED, 10);
      const ALLOWED_VALUES = [0, 1, 999];

      if (Number.isNaN(accredited) || !ALLOWED_VALUES.includes(accredited)) {
        this._addValidationError(
          'ACCREDITED_ERROR',
          'ACCREDITED is invalid',
          this._currentLine.ACCREDITED,
          'ACCREDITED',
        );
        return;
      }

      this._accredited = this._convertAccreditedValue(accredited);
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
    const notes = this._currentLine.NOTES;
    const MAX_LENGTH = 1000;

    if (notes && notes.length > 0) {
      if (notes.length > MAX_LENGTH) {
        this._addValidationError(
          'NOTES_ERROR',
          `NOTES is longer than ${MAX_LENGTH} characters`,
          this._currentLine.NOTES,
          'NOTES',
        );
        return;
      }

      this._notes = notes;
    }
  }

  _checkForEmptyOrNullDate(date) {
    if (!date || date === '') {
      return true;
    }
    return false;
  }

  _addValidationError(errorType, errorMessage, errorSource, columnName) {
    this._validationErrors.push({
      worker: this._currentLine.UNIQUEWORKERID,
      name: this._currentLine.LOCALESTID,
      lineNumber: this._lineNumber,
      errCode: TrainingCsvValidator[errorType],
      errType: errorType,
      error: errorMessage,
      source: errorSource,
      column: columnName,
    });
  }

  get validationErrors() {
    // include the "origin" of validation error
    return this._validationErrors.map((thisValidation) => {
      return {
        origin: 'Training',
        ...thisValidation,
      };
    });
  }
}

module.exports.TrainingCsvValidator = TrainingCsvValidator;
