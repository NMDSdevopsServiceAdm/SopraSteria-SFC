// the Town property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.TownProperty = class TownProperty extends ChangePropertyPrototype {
  constructor() {
    super('Town');
    this._allowNull = true;
  }

  static clone() {
    return new TownProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.town) {
      this.property = document.town;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.town;
  }
  savePropertyToSequelize() {
    return {
      town: this.property,
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
        town: this.property,
      };
    }

    return {
      town: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
