// the staff property is a value property only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.StaffProperty = class StaffProperty extends ChangePropertyPrototype {
  constructor() {
    super('NumberOfStaff');
  }

  static clone() {
    return new StaffProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (/^-?[0-9]+$/.test(String(document.numberOfStaff))) {
      const givenStaff = parseInt(document.numberOfStaff, 10);
      const MAX_STAFF = 999;
      const MIN_STAFF = 0;

      //if document.numberOfStaff is numeric it must be in range
      if (givenStaff >= MIN_STAFF && givenStaff <= MAX_STAFF) {
        this.property = givenStaff;
      } else {
        this.property = null;
      }
    } else if (document.numberOfStaff) {
      //any other non falsy value fails validation
      this.property = null;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.NumberOfStaffValue;
  }
  savePropertyToSequelize() {
    return {
      NumberOfStaffValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // staff is a simple Number - but 0 is valid
    return currentValue !== null && newValue !== null && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true, wdfEffectiveDate = false) {
    if (wdfEffectiveDate) {
      return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
    }

    if (!withHistory) {
      // simple form
      return {
        numberOfStaff: this.property,
      };
    }

    return {
      numberOfStaff: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
