// the email property is a value only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.UserEmailProperty = class UserEmailProperty extends ChangePropertyPrototype {
  constructor() {
    super('Email');
  }

  static clone() {
    return new UserEmailProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.email) {
      const EMAIL_MAX_LENGTH = 120;
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
      if (document.email.length > 0 && document.email.length <= EMAIL_MAX_LENGTH && emailRegex.test(document.email)) {
        this.property = document.email;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.EmailValue;
  }
  savePropertyToSequelize() {
    return {
      EmailValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // email is a simple string
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        email: this.property,
      };
    }

    return {
      email: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
