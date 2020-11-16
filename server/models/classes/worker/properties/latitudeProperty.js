const { ChangePropertyPrototype } = require('../../properties/changePrototype');

exports.LatitudeProperty = class LatitudeProperty extends ChangePropertyPrototype {
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

  async restoreFromSequelize(document) {
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
    if (!withHistory) {
      return {
        Latitude: this.property,
      };
    }

    return {
      Latitude: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
