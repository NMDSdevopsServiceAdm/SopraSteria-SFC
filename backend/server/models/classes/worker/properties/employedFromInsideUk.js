// the contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const EMPLOYED_FROM_INSIDE_UK_TYPE = ['Yes', 'No', "Don't know"];
exports.EmployedFromInsideUkProperty = class EmployedFromInsideUkProperty extends ChangePropertyPrototype {
  constructor() {
    super('EmployedFromInsideUk');
    this._allowNull = true;
  }

  static clone() {
    return new EmployedFromInsideUkProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.EmployedFromInsideUk) {
      if (EMPLOYED_FROM_INSIDE_UK_TYPE.includes(document.EmployedFromInsideUk)) {
        this.property = document.EmployedFromInsideUk;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.EmployedFromInsideUkValue;
  }

  savePropertyToSequelize() {
    return {
      EmployedFromInsideUkValue: this.property,
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
        EmployedFromInsideUk: this.property,
      };
    }

    return {
      EmployedFromInsideUk: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
