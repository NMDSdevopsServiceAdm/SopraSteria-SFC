class EstablishmentException {
  constructor(id, uid, name, err, safeErr = null) {
    this._id = id;
    this._uid = uid;
    this._name = name;
    this._err = err;
    this._safeErr = safeErr;
  }

  get id() {
    return this._id;
  }
  get uid() {
    return this._uid;
  }
  get name() {
    return this._name;
  }

  // returns a safe message (undisclosed - safe to return by API)
  get safe() {
    if (this._safeErr) {
      return this._safeErr;
    } else {
      return 'error occurred';
    }
  }

  // returns a local message (full disclosure)
  get message() {
    return this._err;
  }

  // identifier for reporting error is preferred with uid not id
  get identifier() {
    if (this._uid) {
      return this._uid;
    } else {
      return this._id;
    }
  }
}

class EstablishmentSaveException extends EstablishmentException {
  // TODO: parse the sequelize error on create failure
  constructor(id, uid, name, err, safeErr = null) {
    super(id, uid, name, err, safeErr);
  }

  get safe() {
    if (super.id === null) {
      return `Failed to create Establishment with identity: ${super.name}:(${super.identifier}).`;
    } else if (!super.safeErr) {
      return `Failed to save Establishment with identity: ${super.name}:(${super.identifier}).`;
    } else {
      return super.safe;
    }
  }
}

class EstablishmentRestoreException extends EstablishmentException {
  static get NOT_FOUND() {
    return 100;
  } // the Establishment as known by id does not exist
  static get NOT_OWNED() {
    return 200;
  } // the Establishment as known by id does not belong to the User

  constructor(id, uid, name, err, reason = null, safeErr = null) {
    super(id, uid, name, err, safeErr);
    this._reason = reason;
  }

  get safe() {
    if (this._reason && this._reason === UserRestoreException.NOT_FOUND) {
      return `Establishment with identity: ${super.identifier} does not exist.`;
    } else if (this._reason && this._reason === UserRestoreException.NOT_OWNED) {
      // safe disclosure!!!
      return `Establishment with identity: ${super.identifier} does not exist.`;
    } else if (!super.safe) {
      return `Failed to restore Establishment with identity: ${super.identifier}.`;
    } else {
      return super.safe;
    }
  }
}

class EstablishmentJsonException extends EstablishmentException {
  constructor(err, reason = null, safeErr = null) {
    super(null, null, null, err, safeErr);
    this._reason = reason;
  }

  get safe() {
    if (!super.safe) {
      return `Failed to restore Establishment from JSON.`;
    } else {
      return super.safe;
    }
  }
}

class EstablishmentDeleteException extends EstablishmentException {
  constructor(id, uid, name, err, safeErr = null) {
    super(id, uid, name, err, safeErr);
  }

  get safe() {
    if (!super._safeErr) {
      return `Failed to delete Establishment with identity: ${super.identifier}.`;
    } else {
      return super.safe;
    }
  }
}

class EstablishmentValidationException extends EstablishmentException {
  constructor(err, reason = null, safeErr = null) {
    super(null, null, null, err, safeErr);
    this._reason = reason;
  }

  get safe() {
    if (!super.safe) {
      return `Establishment failed validation.`;
    } else {
      return super.safe;
    }
  }
}

module.exports.EstablishmentSaveException = EstablishmentSaveException;
module.exports.EstablishmentRestoreException = EstablishmentRestoreException;
module.exports.EstablishmentDeleteException = EstablishmentDeleteException;
module.exports.EstablishmentJsonException = EstablishmentJsonException;
module.exports.EstablishmentValidationException = EstablishmentValidationException;
