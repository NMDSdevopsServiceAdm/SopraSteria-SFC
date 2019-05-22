const BUDI = require('../BUDI').BUDI;

class Worker {
  constructor(currentLine, lineNumber) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._validationErrors = [];
    this._contractType= null;

    //console.log(`MN DEBUG - current worker (${this._lineNumber}:`, this._currentLine);
  };

  static get CONTRACT_TYPE_ERROR() { return 1000; }

  get contractType() {
    return this._contractType;
  }
  
  _validateContractType() {
    const myContractType = parseInt(this._currentLine.EMPLSTATUS);

    //console.log("NM DEBUG: contract type (employment status): ", myContractType)
    if (Number.isNaN(myContractType)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.CONTRACT_TYPE_ERROR,
        errType: 'CONTRACT_TYPE_ERROR',
        error: "Contract Type must be an integer",
        source: this._currentLine.EMPLSTATUS,
      });
      return false;
    } else {
      this._contractType = myContractType;
      return true;
    }
  }

  _transformContractType() {
    if (this._contractType) {
      this._contractType = BUDI.contractType(BUDI.TO_ASC, this._contractType);
    }
  };

  // returns true on success, false is any attribute of Worker fails
  validate() {
    let status = true;

    status = status ? this._validateContractType() : status;

    return status;
  };

  // returns true on success, false is any attribute of Worker fails
  transform() {
    let status = true;

    status = status ? this._transformContractType() : status;

    return status;
  };

  toJSON() {
    return {
      contractType: {
        id: this._contractType
      }
    };
  };

  get validationErrors() {
    return this._validationErrors;
  };
};

module.exports.Worker = Worker;
