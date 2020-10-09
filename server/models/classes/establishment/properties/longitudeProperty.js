const { ChangePropertyPrototype } = require('../../properties/changePrototype');

exports.LongitudeProperty = class LongitudeProperty extends ChangePropertyPrototype {
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

  async restoreFromSequelize(document) {
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
    if (!withHistory) {
      return {
        Longitude: this.property,
      };
    }

    return {
      Longitude: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
