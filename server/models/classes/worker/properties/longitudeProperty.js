const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;

exports.LongitudeProperty = class LongitudeProperty extends PropertyPrototype {
  constructor() {
    super('Longitude');
  }

  static clone() {
    return new LongitudeProperty();
  }

  async restoreFromJson(document) {
    if (document.Longitude) {
      this.property = document.Longitude;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.Longitude;
  }

  savePropertyToSequelize() {
    return {
      Longitude: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    return {
      Longitude: this.property,
    };
  }
};
