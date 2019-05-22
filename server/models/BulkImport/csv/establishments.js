const BUDI = require('../BUDI').BUDI;

class Establishment {
  constructor(currentLine, lineNumber) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._validationErrors = [];
    this._mainService = null;

    //console.log(`WA DEBUG - current establishment (${this._lineNumber}:`, this._currentLine);
  };

  static get MAIN_SERVICE_ERROR() { return 1000; }


  get mainService() {
    return this._mainService;
  }
  
  _validateMainService() {
    const myMainService = parseInt(this._currentLine.MAINSERVICE);
    if (Number.isNaN(myMainService)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.MAIN_SERVICE_ERROR,
        errType: `MAIN_SERVICE_ERROR`,
        error: "Main Service must be an integer",
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
