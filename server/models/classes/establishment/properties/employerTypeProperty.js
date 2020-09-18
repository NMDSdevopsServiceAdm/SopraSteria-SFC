// the employertype  property is a value (enum) property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const ALLOWED_EMPLOYER_TYPES = [
  'Private Sector',
  'Voluntary / Charity',
  'Other',
  'Local Authority (generic/other)',
  'Local Authority (adult services)',
];
const ALLOWED_EMPLOYER_OTHER_TYPES = ['Other'];
const OTHER_MAX_LENGTH = 120;

exports.EmployerTypeProperty = class EmployerTypeProperty extends ChangePropertyPrototype {
  constructor() {
    super('EmployerType');
  }

  static clone() {
    return new EmployerTypeProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.employerType) {
      if (
        ALLOWED_EMPLOYER_TYPES.includes(document.employerType.value) &&
        (!document.employerType.other ||
          (ALLOWED_EMPLOYER_OTHER_TYPES.includes(document.employerType.value) &&
            document.employerType.other &&
            document.employerType.other.length <= OTHER_MAX_LENGTH))
      ) {
        this.property = {
          value: document.employerType.value,
          other: document.employerType.other ? document.employerType.other : null,
        };
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return {
      value: document.EmployerTypeValue,
      other: document.EmployerTypeOther,
    };
  }
  savePropertyToSequelize() {
    return {
      EmployerTypeValue: this.property.value,
      EmployerTypeOther: this.property.other,
    };
  }

  isEqual(currentValue, newValue) {
    // employer type is a simple (enum) string
    return (
      currentValue &&
      newValue &&
      currentValue.value === newValue.value &&
      ((currentValue.other && newValue.other && currentValue.other === newValue.other) ||
        (!currentValue.other && !newValue.other))
    );
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true, wdfEffectiveDate = false) {
    if (wdfEffectiveDate) {
      return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
    }

    if (!withHistory) {
      // simple form
      return {
        employerType: {
          value: this.property.value,
          other: this.property.other ? this.property.other : undefined,
        },
      };
    }

    return {
      employerType: {
        currentValue: {
          value: this.property.value,
          other: this.property.other ? this.property.other : undefined,
        },
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
