class metaData {
  constructor() {
    this._username = null;
    this._id = null;
    this._fileType = null;
    this._filename = null;
    this._warnings = null;
    this._errors = null;
    this._records = null;
    this._filenameAndExtension = null;
  };

  get userName() {
    return this._userName;
  }
  get id() {
    return this._id;
  }
  get fileType() {
    return this._fileType;
  }
  get filename() {
    return this._filename;
  }
  get filenameAndExtension() {
    return this._filenameAndExtension;
  }
  get warnings() {
    return this._warnings;
  }
  get errors() {
    return this._errors;
  }
  get records() {
    return this._records;
  }

  set userName(userName) {
    this._UserName = userName;
  }

  set id(id) {
    this._id = id;
  }

  set fileType(fileType) {
  this._fileType = fileType;
  }

  set filename(filename) {
    return this._filename = filename;
  }

  set filenameAndExtension(filenameAndExtension) {
    return this._filenameAndExtension = filenameAndExtension;
  }

  set warnings(warnings) {
    return this._warnings = warnings;
  }

  set errors(errors) {
    return this._errors = errors;
  }

  set records(records) {
    return this._records = records;
  }

  toJSON() {
    return {
      filename:this._filenameAndExtension ? this._filenameAndExtension : null ,
      records:this._records ? this._records : 0,
      errors:this._errors ? this._errors : 0,
      warnings:this._warnings ? this._warnings : 0
    }
  }
};

module.exports.metaData = metaData;
