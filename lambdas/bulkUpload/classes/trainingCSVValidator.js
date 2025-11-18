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
    this.trainingName = null;
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
  static get TRAININGNAME_ERROR() {
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
  static get WHODELIVERED_ERROR() {
    return 1080;
  }
  static get PROVIDERNAME_ERROR() {
    return 1090;
  }
  static get HOWDELIVERED_ERROR() {
    return 1100;
  }
  static get VALIDITY_ERROR() {
    return 1110;
  }

  static get DATE_COMPLETED_WARNING() {
    return 2020;
  }
  static get EXPIRY_DATE_WARNING() {
    return 2030;
  }
  static get TRAININGNAME_WARNING() {
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
  static get WHODELIVERED_WARNING() {
    return 2090;
  }
  static get PROVIDERNAME_WARNING() {
    return 2090;
  }
  static get HOWDELIVERED_WARNING() {
    return 2100;
  }
  static get VALIDITY_WARNING() {
    return 2110;
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
    this._validateWhoDelivered();
    this._validateProviderName();
    this._validateHowDelivered();
    this._validateValidity();
  }

  toJSON() {
    return {
      localId: this.localeStId,
      uniqueWorkerId: this.uniqueWorkerId,
      completed: this.dateCompleted ? this.dateCompleted.format('DD/MM/YYYY') : undefined,
      expiry: this.expiry ? this.expiry.format('DD/MM/YYYY') : undefined,
      trainingName: this.trainingName,
      category: this.category,
      accredited: this.accredited,
      notes: this.notes,
      lineNumber: this.lineNumber,
      deliveredBy: this.deliveredBy,
      trainingProviderFk: this.trainingProviderFk,
      howWasItDelivered: this.howWasItDelivered,
      doesNotExpire: this.doesNotExpire,
      validityPeriodInMonth: this.validityPeriodInMonth,
    };
  }

  toAPI() {
    const changeProperties = {
      trainingCategory: {
        id: this.category,
      },
      completed: this.dateCompleted ? this.dateCompleted.format('YYYY-MM-DD') : undefined,
      expires: this.expiry ? this.expiry.format('YYYY-MM-DD') : undefined,
      title: this.trainingName ? this.trainingName : undefined,
      notes: this.notes ? this.notes : undefined,
      accredited: this.accredited ? this.accredited : undefined,
      deliveredBy: this.deliveredBy,
      trainingProviderFk: this.trainingProviderFk,
      howWasItDelivered: this.howWasItDelivered,
      doesNotExpire: this.doesNotExpire,
      validityPeriodInMonth: this.validityPeriodInMonth,
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

  _validateDescription() {
    const trainingName = this.currentLine.TRAININGNAME;
    const MAX_LENGTH = 120;
    const errMessage = errors._getValidateTrainingNameErrMessage(trainingName, MAX_LENGTH);
    if (!errMessage) {
      this.trainingName = trainingName;
      return;
    }
    this._addValidationError('TRAININGNAME_ERROR', errMessage, this.currentLine.TRAININGNAME, 'TRAININGNAME');
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

  _validateWhoDelivered() {
    if (!this.currentLine.WHODELIVERED) {
      return;
    }
    const deliveredBy = this._convertWhoDelivered(this.currentLine.WHODELIVERED);

    if (!deliveredBy) {
      this._addValidationError(
        'WHODELIVERED_ERROR',
        'The code you have entered for WHODELIVERED is invalid',
        this.currentLine.WHODELIVERED,
        'WHODELIVERED',
      );
    }

    this.deliveredBy = deliveredBy;
  }

  _convertWhoDelivered(key) {
    const whoDeliveredValues = {
      1: 'In-house staff',
      2: 'External provider',
    };

    return whoDeliveredValues[key];
  }

  _validateProviderName() {
    if (!this.currentLine.PROVIDERNAME) {
      return;
    }

    if (this.deliveredBy !== 'External provider') {
      this._addValidationWarning(
        'PROVIDERNAME_WARNING',
        'PROVIDERNAME will be ignored as WHODELIVERED is not 2 (External provider)',
        this.currentLine.PROVIDERNAME,
        'WHODELIVERED/PROVIDERNAME',
      );
      return;
    }

    const providerBulkUploadCode = parseInt(this.currentLine.PROVIDERNAME);
    const providerFk = this.BUDI.trainingProvider(this.BUDI.TO_ASC, providerBulkUploadCode);

    if (!providerFk) {
      this._addValidationError(
        'PROVIDERNAME_ERROR',
        'The code you have entered for PROVIDERNAME is invalid',
        this.currentLine.PROVIDERNAME,
        'PROVIDERNAME',
      );
      return;
    }

    this.trainingProviderFk = providerFk;
  }

  _validateHowDelivered() {
    if (!this.currentLine.HOWDELIVERED) {
      return;
    }

    const howWasItDelivered = this._convertHowDelivered(this.currentLine.HOWDELIVERED);

    if (!howWasItDelivered) {
      this._addValidationError(
        'HOWDELIVERED_ERROR',
        'The code you have entered for HOWDELIVERED is invalid',
        this.currentLine.HOWDELIVERED,
        'HOWDELIVERED',
      );
      return;
    }

    this.howWasItDelivered = howWasItDelivered;
  }

  _convertHowDelivered(key) {
    const howDeliveredValues = {
      1: 'Face to face',
      2: 'E-learning',
    };

    return howDeliveredValues[key];
  }

  _validateValidity() {
    const validity = this.currentLine.VALIDITY;
    if (!validity) {
      return;
    }

    if (validity === 'none') {
      this._handleValidityAsNone();
      return;
    }

    const validityInMonth = parseInt(validity);

    if (validityInMonth > 1 && validityInMonth <= 999) {
      this.doesNotExpire = false;
      this.validityPeriodInMonth = validityInMonth;
      this._matchUpWithExpiryDate();
      return;
    }

    this._addValidationError(
      'VALIDITY_ERROR',
      'VALIDITY should be either "none" or a number between 1 and 999',
      this.currentLine.VALIDITY,
      'VALIDITY',
    );
  }

  _handleValidityAsNone() {
    this.doesNotExpire = true;
    this.validityPeriodInMonth = null;
    if (this.expiry) {
      this._addValidationWarning(
        'VALIDITY_WARNING',
        'The VALIDITY you have entered does not match the EXPIRYDATE',
        this.currentLine.VALIDITY,
        'EXPIRYDATE/VALIDITY',
      );
    }
    return;
  }

  _matchUpWithExpiryDate() {
    if (!this.dateCompleted) {
      return;
    }

    const expectedExpiryDate = this.dateCompleted.clone().add(this.validityPeriodInMonth, 'months').subtract(1, 'day');

    if (!this.expiry) {
      this.expiry = expectedExpiryDate;
      return;
    }

    const expiryDateMatchExpected = expectedExpiryDate.isSame(this.expiry, 'day');
    if (!expiryDateMatchExpected) {
      this._addValidationWarning(
        'VALIDITY_WARNING',
        'The EXPIRYDATE you have entered does not match the VALIDITY',
        this.currentLine.VALIDITY,
        'EXPIRYDATE/VALIDITY',
      );
    }
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

  _addValidationWarning(warnType, warning, warnSource, columnName) {
    this.validationErrors.push({
      origin: 'Training',
      worker: this.currentLine.UNIQUEWORKERID,
      name: this.currentLine.LOCALESTID,
      lineNumber: this.lineNumber,
      warnCode: TrainingCsvValidator[warnType],
      warnType: warnType,
      warning: warning,
      source: warnSource,
      column: columnName,
    });
  }
}

module.exports.TrainingCsvValidator = TrainingCsvValidator;
