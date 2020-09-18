const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const MAX_LENGTH = 120;

exports.LocalIdentifierProperty = class LocalIdentifierProperty extends ChangePropertyPrototype {
  constructor() {
    super('LocalIdentifier');
  }

  static clone() {
    return new LocalIdentifierProperty();
  }

  async restoreFromJson(document) {
    if (document.localIdentifier) {
      if (document.localIdentifier.length <= MAX_LENGTH) {
        this.property = document.localIdentifier;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.LocalIdentifierValue;
  }

  savePropertyToSequelize() {
    return {
      LocalIdentifierValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        localIdentifier: this.property,
      };
    }

    return {
      localIdentifier: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
