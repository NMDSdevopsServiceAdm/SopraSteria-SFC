// the name  property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.NameProperty = class NameProperty extends ChangePropertyPrototype {
  constructor() {
    super('Name');
  }

  static clone() {
    return new NameProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.name) {
      const MAX_LENGTH = 120;
      if (document.name.length <= MAX_LENGTH) {
        this.property = document.name;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.NameValue;
  }
  savePropertyToSequelize() {
    return {
      NameValue: this.property,
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
        name: this.property,
      };
    }

    return {
      name: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
