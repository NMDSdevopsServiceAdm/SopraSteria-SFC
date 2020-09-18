// the Address2 property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.Address2Property = class Address2Property extends ChangePropertyPrototype {
  constructor() {
    super('Address2');
    this._allowNull = true;
  }

  static clone() {
    return new Address2Property();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.address2) {
      this.property = document.address2;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.address2;
  }
  savePropertyToSequelize() {
    return {
      address2: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // employer type is a simple string
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        address2: this.property,
      };
    }

    return {
      address2: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
