// the contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const CARRY_OUT_DHA_TYPE = ['Yes', 'No', "Don't know"];

exports.CarryOutDelegatedHealthcareActivitiesProperty = class CarryOutDelegatedHealthcareActivitiesProperty extends (
  ChangePropertyPrototype
) {
  constructor() {
    super('CarryOutDelegatedHealthcareActivities');
    this._allowNull = true;
  }

  static clone() {
    return new CarryOutDelegatedHealthcareActivitiesProperty();
  }

  async restoreFromJson(document) {
    if ([...CARRY_OUT_DHA_TYPE, null].includes(document.carryOutDelegatedHealthcareActivities)) {
      this.property = document.carryOutDelegatedHealthcareActivities;
      return;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.carryOutDelegatedHealthcareActivities;
  }

  savePropertyToSequelize() {
    return {
      carryOutDelegatedHealthcareActivities: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        carryOutDelegatedHealthcareActivities: this.property,
      };
    }

    return {
      carryOutDelegatedHealthcareActivities: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
