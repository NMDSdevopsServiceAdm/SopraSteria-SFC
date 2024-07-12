// the contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const EMPLOYED_FROM_INSIDE_UK_TYPE = ['Yes', 'No', "Don't know"];
exports.EmployedFromOutsideUkProperty = class EmployedFromOutsideUkProperty extends ChangePropertyPrototype {
  constructor() {
    super('EmployedFromOutsideUk');
    this._allowNull = true;
  }

  static clone() {
    return new EmployedFromOutsideUkProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.employedFromOutsideUk || document.employedFromOutsideUk === null) {
      if (EMPLOYED_FROM_INSIDE_UK_TYPE.includes(document.employedFromOutsideUk)) {
        this.property = document.employedFromOutsideUk;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.EmployedFromOutsideUkValue;
  }

  savePropertyToSequelize() {
    return {
      EmployedFromOutsideUkValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // a simple (enum'd) string compare
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        employedFromOutsideUk: this.property,
      };
    }

    return {
      employedFromOutsideUk: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
