const BUDI = require('../BUDI').BUDI;

class Establishment {
  constructor(currentLine, lineNumber) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._validationErrors = [];


    // CSV properties
    this._localId = null;
    this._mainService = null;
    this._status = null;
    this._name = null;

    //console.log(`WA DEBUG - current establishment (${this._lineNumber}:`, this._currentLine);
  };

  static get MAIN_SERVICE_ERROR() { return 1000; }
  static get LOCAL_ID_ERROR() { return 1010; }
  static get STATUS_ERROR() { return 1020; }
  static get NAME_ERROR() { return 1030; }


  get localId() {
    return this._localId;
  }
  get status() {
    return this._status;
  }
  get name() {
    return this._name;
  }


  get mainService() {
    return this._mainService;
  }

  _validateLocalisedId() {
    const myLocalId = this._currentLine.LOCALESTID;

    // must be present and not empty
    if (!myLocalId || myLocalId.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: "Local Identifier must be defined",
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myLocalId.length >= 50) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: "Local Identifier (LOCALESTID) must be no more than 50 characters",
        source: myLocalId,
      });
      return false;      
    } else {
      this._localId = myLocalId;
      return true;
    }
  }

  _validateStatus() {
    const statusValues = ['DELETE', 'UPDATE', 'UNCHECKED', 'NOCHANGE', 'NEW'];
    const myStatus = this._currentLine.STATUS ? this._currentLine.STATUS.toUpperCase() : this._currentLine.STATUS;

    // must be present and must be one of the preset values (case insensitive)
    if (!statusValues.includes(myStatus)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STATUS_ERROR,
        errType: `STATUS_ERROR`,
        error: `Status (STATUS) must be one of: ${statusValues}`,
        source: this._currentLine.STATUS,
      });
      return false;
    } else {
      this._status = myStatus;
      return true;
    }
  }

  _validateEstablishmentName() {
    const myName = this._currentLine.ESTNAME;

    // must be present and must be one of the preset values (case sensitive)
    if (!myName || myName.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `NAME_ERROR`,
        error: 'Establishment Name (ESTNAME) must be defined',
        source: myName,
      });
      return false;
    } else if (myName.length > 120) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `NAME_ERROR`,
        error: 'Establishment Name (ESTNAME) must be no more than 120 characters',
        source: myName,
      });
      return false;
    } else {
      this._name = myName;
      return true;
    }
  }

  
  _validateMainService() {
    const myMainService = parseInt(this._currentLine.MAINSERVICE);
    if (Number.isNaN(myMainService)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.MAIN_SERVICE_ERROR,
        errType: `MAIN_SERVICE_ERROR`,
        error: "Main Service (MAINSERVICE) must be an integer",
        source: this._currentLine.MAINSERVICE,
      });
      return false;
    } else {
      this._mainService = myMainService;
      return true;
    }
  }

  _transformMainService() {
    if (this._mainService) {
      this._mainService = BUDI.services(BUDI.TO_ASC, this._mainService);
    }
  }

  // returns true on success, false is any attribute of Establishment fails
  validate() {
    let status = true;

    status = status ? this._validateLocalisedId() : status;
    status = status ? this._validateStatus() : status;
    status = status ? this._validateEstablishmentName() : status;


    status = status ? this._validateMainService() : status;

    return status;
  }

  // returns true on success, false is any attribute of Establishment fails
  transform() {
    let status = true;

    status = status ? this._transformMainService() : status;

    return status;
  }

  toJSON() {
    return {
      mainService: {
        id: this._mainService
      }
    };
  };

  get validationErrors() {
    return this._validationErrors;
  };
};

module.exports.Establishment = Establishment;
