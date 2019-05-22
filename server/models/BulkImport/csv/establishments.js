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
    this._address = null;
    this._postcode = null;

    //console.log(`WA DEBUG - current establishment (${this._lineNumber}:`, this._currentLine);
  };

  static get MAIN_SERVICE_ERROR() { return 1000; }
  static get LOCAL_ID_ERROR() { return 1010; }
  static get STATUS_ERROR() { return 1020; }
  static get NAME_ERROR() { return 1030; }
  static get ADDRESS_ERROR() { return 1040; }


  get localId() {
    return this._localId;
  }
  get status() {
    return this._status;
  }
  get name() {
    return this._name;
  }

  get address() {
    return this._address;
  }
  get poostcode() {
    return this._postcode;
  }


  get mainService() {
    return this._mainService;
  }

  _validateLocalisedId() {
    const myLocalId = this._currentLine.LOCALESTID;

    // must be present and n more than 50 characters
    const MAX_LENGTH = 50;

    if (!myLocalId || myLocalId.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: "Local Identifier must be defined",
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myLocalId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: `Local Identifier (LOCALESTID) must be no more than ${MAX_LENGTH} characters`,
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

    // must be present and no more than 120 characters
    const MAX_LENGTH = 120;

    if (!myName || myName.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `NAME_ERROR`,
        error: 'Establishment Name (ESTNAME) must be defined',
        source: myName,
      });
      return false;
    } else if (myName.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `NAME_ERROR`,
        error: `Establishment Name (ESTNAME) must be no more than ${MAX_LENGTH} characters`,
        source: myName,
      });
      return false;
    } else {
      this._name = myName;
      return true;
    }
  }

  _validateAddress() {
    const myAddress1 = this._currentLine.ADDRESS1;
    const myAddress2 = this._currentLine.ADDRESS2;
    const myAddress3 = this._currentLine.ADDRESS3;
    const myTown = this._currentLine.POSTTOWN;
    const myPostcode = this._currentLine.POSTCODE;

    // TODO - if town is empty, match against PAF
    // TODO - validate postcode against PAF

    // adddress 1 is mandatory and no more than 40 characters
    const MAX_LENGTH = 40;

    if (!myAddress1 || myAddress1.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `ADDRESS_ERROR`,
        error: 'First line of address (ADDRESS1) must be defined',
        source: myAddress1,
      });
    } else if (myAddress1.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `First line of address (ADDRESS1) must be no more than ${MAX_LENGTH} characters`,
        source: myAddress1,
      });
    }

    if (myAddress2 && myAddress2.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Second line of address (ADDRESS2) must be no more than ${MAX_LENGTH} characters`,
        source: myAddress2,
      });
    }

    if (myAddress3 && myAddress3.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Third line of address (ADDRESS3) must be no more than ${MAX_LENGTH} characters`,
        source: myAddress3,
      });
    }

    if (myTown && myTown.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `{Post town} (POSTTOWN) must be no more than ${MAX_LENGTH} characters`,
        source: myTown,
      });
    }

    // TODO - registration/establishment APIs do not validate postcode (relies on the frontend - this must be fixed)
    const postcodeRegex = /^[A-Za-z]{1,2}[0-9]{1,2}\s{1}[0-9][A-Za-z]{2}$/;
    const POSTCODE_MAX_LENGTH = 40;


    console.log("WA DEBUG: postcode/regex match: ", myPostcode, postcodeRegex.test(myPostcode.toUpperCase()));

    if (!myPostcode || myPostcode.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `ADDRESS_ERROR`,
        error: 'Postcode (POSTCODE) must be defined',
        source: myPostcode,
      });
    } else if (myPostcode.length > POSTCODE_MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Postcode (POSTCODE) must be no more than ${POSTCODE_MAX_LENGTH} characters`,
        source: myPostcode,
      });
    } else if (!postcodeRegex.test(myPostcode)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Postcode (POSTCODE) unexpected format`,
        source: myPostcode,
      });
    }

    if (this._validationErrors.length > 0) {
      return false;
    }

    // concatenate the address
    this._address = myAddress1;
    this._address = myAddress2 ? `${this._address}, ${myAddress2}` : this._address;
    this._address = myAddress3 ? `${this._address}, ${myAddress3}` : this._address;
    this._address = myTown ? `${this._address}, ${myTown}` : this._address;
    this._postcode = myPostcode;

    return true;
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

    status = status ? this._validateAddress() : status;
  

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
