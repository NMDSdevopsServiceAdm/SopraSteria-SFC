// the National Insurance Number property is a type being JobId and Title
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.WorkerNationalInsuranceNumberProperty = class WorkerNationalInsuranceNumberProperty extends ChangePropertyPrototype {
  constructor() {
    super('NationalInsuranceNumber');
    this._allowNull = true;
  }

  static clone() {
    return new WorkerNationalInsuranceNumberProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    const niRegex = /^(?!BG)(?!GB)(?!NK)(?!KN)(?!TN)(?!NT)(?!ZZ)(?:[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z])(?:\s*\d\s*){6}([A-D]|\s)$/;
    if (document.nationalInsuranceNumber || document.nationalInsuranceNumber === null) {
      if (
        document.nationalInsuranceNumber !== null &&
        document.nationalInsuranceNumber.length <= 13 &&
        niRegex.test(document.nationalInsuranceNumber)
      ) {
        this.property = document.nationalInsuranceNumber;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.NationalInsuranceNumberValue;
  }
  savePropertyToSequelize() {
    return {
      NationalInsuranceNumberValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // a simple string compare
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        nationalInsuranceNumber: this.property,
      };
    }

    return {
      nationalInsuranceNumber: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
