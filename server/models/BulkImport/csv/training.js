const BUDI = require('../BUDI').BUDI;
const moment = require('moment');

class Training {
  constructor(currentLine, lineNumber) {
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
  };

  static get LOCALESTID_ERROR() { return 1000; }
  static get UNIQUE_WORKER_ID_ERROR() { return 1010; }
  static get DATE_COMPLETED_ERROR() { return 1020; }
  static get EXPIRY_DATE_ERROR() { return 1030; }
  static get DESCRIPTION_ERROR() { return 1040; }
  static get CATEGORY_ERROR() { return 1050; }
  static get ACCREDITED_ERROR() { return 1060; }

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
    this._dateCompleted;
  }
  get expiry() {
    this._expiry;
  }
  get description() {
    return this._description;
  }
  get category() {
    return _category;
  }
  get accredited() {
    return this._accredited;
  }
  
  _validateLocaleStId() {
    const myLocaleStId = this._currentLine.LOCALESTID;
    const MAX_LENGTH = 50;

    if (!myLocaleStId || myLocaleStId.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Training.LOCALESTID_ERROR,
        errType: `LOCALESTID_ERROR`,
        error: "Locale ST ID (LOCALESTID) must be defined (not empty)",
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myLocaleStId.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Training.LOCALESTID_ERROR,
        errType: `LOCALESTID_ERROR`,
        error: `Locale ST ID (LOCALESTID) must be no more than ${MAX_LENGTH} characters`,
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      this._localeStId = myLocaleStId;
      return true;
    }
  }

  _validateUniqueWorkerId() {
    const myUniqueId = this._currentLine.UNIQUEWORKERID;
    const MAX_LENGTH = 50;

    if (!myUniqueId || myUniqueId.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Training.UNIQUE_WORKER_ID_ERROR,
        errType: `UNIQUE_WORKER_ID_ERROR`,
        error: "Unique Worker ID (UNIQUEWORKERID) must be defined (not empty)",
        source: this._currentLine.UNIQUEWORKERID,
      });
      return false;
    } else if (myUniqueId.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Training.UNIQUE_WORKER_ID_ERROR,
        errType: `UNIQUE_WORKER_ID_ERROR`,
        error: `Unique Worker ID (UNIQUEWORKERID) must be no more than ${MAX_LENGTH} characters`,
        source: this._currentLine.UNIQUEWORKERID,
      });
      return false;
    } else {
      this._uniqueWorkerId = myUniqueId;
      return true;
    }
  }

  _validateDateCompleted() {
    // optional
    const myDateCompleted = this._currentLine.DATECOMPLETED;
    const dateFormatRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;

    const actualDate = moment.utc(myDateCompleted, "DD/MM/YYYY");

    if (myDateCompleted) {
      if (!dateFormatRegex.test(myDateCompleted)) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Training.DATE_COMPLETED_ERROR,
          errType: `DATE_COMPLETED_ERROR`,
          error: "Date Completed (DATECOMPLETED) must use the format dd/mm/yyyy",
          source: this._currentLine.DATECOMPLETED,
        });
        return false;
      } else if (!actualDate.isValid()) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Training.DATE_COMPLETED_ERROR,
          errType: `DATE_COMPLETED_ERROR`,
          error: "Date Completed (DATECOMPLETED) must be a valid date (e.g. 29/02/2019 is not a valid date because 2019 is not a leap year)",
          source: this._currentLine.DATECOMPLETED,
        });
        return false;
      } else {

        this._dateCompleted = actualDate;
        return true;
      }
    } else {
      return true;
    }
  }

  _validateExpiry() {
    // optional
    const myDateExpiry = this._currentLine.EXPIRYDATE;
    const dateFormatRegex =  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;

    const actualDate = moment.utc(myDateExpiry, "DD/MM/YYYY");

    if (myDateExpiry) {
      if (!dateFormatRegex.test(myDateExpiry)) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Training.EXPIRY_DATE_ERROR,
          errType: `EXPIRY_DATE_ERROR`,
          error: "Expiry Date (EXPIRYDATE) must use the format dd/mm/yyyy",
          source: this._currentLine.EXPIRYDATE,
        });
        return false;
      } else if (!actualDate.isValid()) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Training.EXPIRY_DATE_ERROR,
          errType: `EXPIRY_DATE_ERROR`,
          error: "Expiry Date  (EXPIRYDATE) must be a valid date (e.g. 29/02/2019 is not a valid date because 2019 is not a leap year)",
          source: this._currentLine.EXPIRYDATE,
        });
        return false;
      } else {

        this._expiry = actualDate;
        return true;
      }
    } else {
      return true;
    }
  }

  _validateDescription() {
    const myDescription = this._currentLine.DESCRIPTION;
    const MAX_LENGTH = 1000;

    if (!myDescription || myDescription.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Training.DESCRIPTION_ERROR,
        errType: `DESCRIPTION_ERROR`,
        error: "Description (DESCRIPTION) must be defined (not empty)",
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myDescription.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Training.DESCRIPTION_ERROR,
        errType: `DESCRIPTION_ERROR`,
        error: `Description (DESCRIPTION) must be no more than ${MAX_LENGTH} characters`,
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      this._description = myDescription;
      return true;
    }
  }

  _validateCategory() {
    const myCategory = parseInt(this._currentLine.CATEGORY);
    if (Number.isNaN(myCategory)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Training.CATEGORY_ERROR,
        errType: `CATEGORY_ERROR`,
        error: "Category (CATEGORY) must be an integer",
        source: this._currentLine.CATEGORY,
      });
      return false;
    } else {
      this._category = myCategory;
      return true;
    }
  }

  _validateAccredited() {
    const myAccredited = parseInt(this._currentLine.ACCREDITED);
    const ALLOWED_VALUES = [0,1];
    if (Number.isNaN(myAccredited)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Training.ACCREDITED_ERROR,
        errType: `ACCREDITED_ERROR`,
        error: "Accredited (ACCREDITED) must be an integer",
        source: this._currentLine.ACCREDITED,
      });
      return false;
    } else if (!ALLOWED_VALUES.includes(myAccredited)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Training.ACCREDITED_ERROR,
        errType: `ACCREDITED_ERROR`,
        error: `Accredited (ACCREDITED) must be one of: ${ALLOWED_VALUES}`,
        source: this._currentLine.ACCREDITED,
      });
      return false;
    } else {
      switch (myAccredited) {
        case 0:
          this._accredited = 'No';
          break;
        case 1:
          this._accredited = 'Yes';
          break;
      }
      return true;
    }
  }

  _transformTrainingCategory() {
    if (this._category) {
      const mappedCategory = BUDI.trainingCaterogy(BUDI.TO_ASC, this._category);
      if (mappedCategory === null) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Training.CATEGORY_ERROR,
          errType: `CATEGORY_ERROR`,
          error: `Training Category (CATEGORY): ${this._category} is unknown`,
          source: this._currentLine.CATEGORY,
        });
      } else {
        this._category = mappedCategory;
      }
    }
  }

  // returns true on success, false is any attribute of Training fails
  validate() {
    let status = true;

    status = !this._validateLocaleStId() ? false : status;
    status = !this._validateUniqueWorkerId() ? false : status;
    status = !this._validateDateCompleted() ? false : status;
    status = !this._validateExpiry() ? false : status;
    status = !this._validateDescription() ? false : status;
    status = !this._validateCategory() ? false : status;
    status = !this._validateAccredited() ? false : status;
  
    return status;
  }

  transform() {
    let status = true;

    status = !this._transformTrainingCategory() ? false : status;

    return status;
  }

  toJSON() {
    return {
      localeStId: this._localeStId,
      uniqueWorkerId: this._uniqueWorkerId,
      completed: this._dateCompleted ? this._dateCompleted.format('DD/MM/YYYY') : undefined,
      expiry: this._expiry ? this._expiry.format('DD/MM/YYYY') : undefined,
      description: this._description,
      category: this._category,
      accredited: this._accredited,
    };
  };

  toAPI() {
    const TITLE_MAX_LENGTH=120;

    // split the description between ASCWDS `title` and `notes`.

    const changeProperties = {
      trainingCategory: {
        id: this._category
      },
      completed: this._dateCompleted ? this._dateCompleted.format('YYYY-MM-DD') : undefined,
      expires: this._expiry ? this._expiry.format('YYYY-MM-DD') : undefined,
      title: this._description ? this._description.substring(0,TITLE_MAX_LENGTH) : undefined,
      notes: this._description && this._description.length > TITLE_MAX_LENGTH ? this._description.substring(TITLE_MAX_LENGTH-1) : undefined,
      accredited: this._accredited ? this._accredited : undefined,
    };

    return changeProperties;
  };

  get validationErrors() {
    return this._validationErrors;
  };
};

module.exports.Training = Training;
