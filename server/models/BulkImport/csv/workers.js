class Workers {
  constructor(currentLine, lineNumber) {
    this._currentLIne = currentLine;
    this._lineNumber = lineNumber;
    this._validationErrors = [];
    this._contractType= null;
  };

  get contractType() {
    return this._contractType;
  }
  
  _validateContractType() {
    if (Number.isInteger(currentLine.contractType)) {
      this._contractType = parseInt(this._currentLIne.contractType);
      return true;
    } else {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: 1000,
        error: "Contract Type must be an integer",
      });
      return false;
    }
  }

  _transformContractType() {
    if (this._contractType) {
      this._contractType = BUDI.contractType(BUDI.TO_ASC, this._contractType);
    }
  };

  validate() {
    this._validateContractType();
  };

  transform() {
    this._transformContractType();
  };

  toJSON() {
    return {
      contractType: {
        id: this._contractType
      }
    };
  };

  get validationErrors() {
    return thus._validationErrors;
  };
};

module.exports.Worker = Worker;
