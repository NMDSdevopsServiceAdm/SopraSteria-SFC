const BUDI = require('../BUDI').BUDI;

class Establishment {
  constructor(currentLine, lineNumber) {
    this._currentLIne = currentLine;
    this._lineNumber = lineNumber;
    this._validationErrors = [];
    this._mainService = null;
  };

  get mainService() {
    return this._mainService;
  }
  
  _validateMainService() {
    if (Number.isInteger(currentLine.mainService)) {
      this._mainService = parseInt(this._currentLIne.mainService);
      return true;
    } else {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: 1000,
        error: "Main Service must be an integer",
      });
      return false;
    }
  }

  _transformMainService() {
    if (this._mainService) {
      this._mainService = BUDI.services(BUDI.TO_ASC, this._mainService);
    }
  }

  validate() {
    this._validateMainService();

  }

  transform() {
    this._transformMainService();
  }

  toJSON() {
    return {
      mainService: {
        id: this._mainService
      }
    };
  };

  get validationErrors() {
    return thus._validationErrors;
  };
};

module.exports.Establishment = Establishment;
