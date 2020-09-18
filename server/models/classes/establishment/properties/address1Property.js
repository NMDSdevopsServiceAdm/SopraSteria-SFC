// the Address1 property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.Address1Property = class Address1Property extends ChangePropertyPrototype {
  constructor() {
    super('Address1');
  }

  static clone() {
    return new Address1Property();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.address1) {
      this.property = document.address1;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.address1;
  }
  savePropertyToSequelize() {
    return {
      address1: this.property,
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
        address1: this.property,
      };
    }

    return {
      address1: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
