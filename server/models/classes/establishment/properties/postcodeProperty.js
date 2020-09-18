// the Postcode property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.PostcodeProperty = class PostcodeProperty extends ChangePropertyPrototype {
  constructor() {
    super('Postcode');
  }

  static clone() {
    return new PostcodeProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.postcode) {
      this.property = document.postcode;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.postcode;
  }
  savePropertyToSequelize() {
    return {
      postcode: this.property,
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
        postcode: this.property,
      };
    }

    return {
      postcode: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
