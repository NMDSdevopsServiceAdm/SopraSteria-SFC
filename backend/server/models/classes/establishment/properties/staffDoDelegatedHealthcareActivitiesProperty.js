// the contract property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const STAFF_DO_DHA_TYPE = ['Yes', 'No', "Don't know"];
exports.StaffDoDelegatedHealthcareActivitiesProperty = class StaffDoDelegatedHealthcareActivitiesProperty extends (
  ChangePropertyPrototype
) {
  constructor() {
    super('StaffDoDelegatedHealthcareActivities');
    this._allowNull = true;
  }

  static clone() {
    return new StaffDoDelegatedHealthcareActivitiesProperty();
  }

  async restoreFromJson(document) {
    const propertyInDocument = document.staffDoDelegatedHealthcareActivities;

    if (STAFF_DO_DHA_TYPE.includes(propertyInDocument)) {
      this.property = propertyInDocument;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.StaffDoDelegatedHealthcareActivitiesValue;
  }

  savePropertyToSequelize() {
    return {
      StaffDoDelegatedHealthcareActivitiesValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    if (currentValue == null || newValue == null) return false;
    return currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      return {
        staffDoDelegatedHealthcareActivities: this.property,
      };
    }

    return {
      staffDoDelegatedHealthcareActivities: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
