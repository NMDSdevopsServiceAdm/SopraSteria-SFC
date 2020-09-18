// the phone property is a value only - but of a specific pattern
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.UserPhoneProperty = class UserPhoneProperty extends ChangePropertyPrototype {
  constructor() {
    super('Phone');
  }

  static clone() {
    return new UserPhoneProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    // phone must be non-empty and must match given pattern

    const phonePattern = /^[0-9 x(?=ext 0-9+)]{8,50}$/;
    if (document.phone) {
      if (phonePattern.test(document.phone)) {
        this.property = document.phone;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.PhoneValue;
  }
  savePropertyToSequelize() {
    return {
      PhoneValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // phone is a simple string
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        phone: this.property,
      };
    }

    return {
      phone: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
