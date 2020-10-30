/*
 * A validation is of the format:
 *  {
 *     type: "ERROR | WARNING",
 *     code: 123,
 *     message: "The Date of Birth cannot be after Year of Arrival",
 *     properties: ["DateOfBirth", "YearOfArival"]
 *  }
 */

class ValidationMessage {
  static get ERROR() {
    return 'Error';
  }
  static get WARNING() {
    return 'Warning';
  }

  constructor(type, code, message, properties) {
    this._type = type;
    this._code = code;
    this._message = message;
    this._properties = properties;
  }

  get type() {
    return this._type;
  }

  get isError() {
    return this._type === ValidationMessage.ERROR;
  }
  get isWarning() {
    return this._type === ValidationMessage.WARNING;
  }

  get code() {
    return this._code;
  }
  get message() {
    return this._message;
  }
  get properties() {
    return this._properties;
  }
}

module.exports.ValidationMessage = ValidationMessage;
