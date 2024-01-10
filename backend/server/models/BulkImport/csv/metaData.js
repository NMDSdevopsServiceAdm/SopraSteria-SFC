class MetaData {
  constructor() {
    this._username = null;
    this._id = null;
    this._fileType = null;
    this._filename = null;
    this._warnings = null;
    this._errors = null;
    this._records = null;
    this._deleted = null;
  };

  get userName() {
    return this._username;
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
  get warnings() {
    return this._warnings;
  }
  get errors() {
    return this._errors;
  }
  get records() {
    return this._records;
  }
  get deleted() {
    return this._deleted;
  }

  set userName(userName) {
    this._username = userName;
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

  set warnings(warnings) {
    return this._warnings = warnings;
  }

  set errors(errors) {
    return this._errors = errors;
  }

  set records(records) {
    return this._records = records;
  }

  set deleted(deleted) {
    return this._deleted = deleted;
  }
  
  toJSON() {
    return {
      username: this._username ? this._username : null,
      filename: this._filename ? this._filename : null,
      fileType: this._fileType ? this._fileType : null,
      records: this._records ? this._records : 0,
      errors: this._errors ? this._errors : 0,
      warnings: this._warnings ? this._warnings : 0,
      deleted: this._deleted !== null ? this._deleted : undefined,
    }
  }
};

module.exports.MetaData = MetaData;
