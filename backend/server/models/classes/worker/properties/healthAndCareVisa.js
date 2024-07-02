// the contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const HEALTH_AND_CARE_VISA_TYPE = ['Yes', 'No', "Don't know"];
exports.HealthAndCareVisaProperty = class HealthAndCareVisaProperty extends ChangePropertyPrototype {
  constructor() {
    super('HealthAndCareVisa');
    this._allowNull = true;
  }

  static clone() {
    return new HealthAndCareVisaProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.healthAndCareVisa) {
      if (HEALTH_AND_CARE_VISA_TYPE.includes(document.healthAndCareVisa)) {
        this.property = document.healthAndCareVisa;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.HealthAndCareVisaValue;
  }

  savePropertyToSequelize() {
    return {
      HealthAndCareVisaValue: this.property,
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
        healthAndCareVisa: this.property,
      };
    }

    return {
      healthAndCareVisa: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
