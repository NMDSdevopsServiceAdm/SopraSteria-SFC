const PropertyPrototype = require('../../properties/prototype').PropertyPrototype;

exports.LatitudeProperty = class LatitudeProperty extends PropertyPrototype {
  constructor() {
    super('Latitude');
  }

  static clone() {
    return new LatitudeProperty();
  }

  async restoreFromJson(document) {
    if (document.Latitude) {
      this.property = document.Latitude;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.Latitude;
  }

  savePropertyToSequelize() {
    return {
      Latitude: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    return {
      Latitude: this.property,
    };
  }
};
