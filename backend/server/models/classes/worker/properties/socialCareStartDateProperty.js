// the Social Care Start Date property is an enumeration and optional value; that value is a date, moreso, just the year part
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const START_DATE_TYPE = ['Yes', 'No'];
exports.WorkerSocialCareStartDateProperty = class WorkerSocialCareStartDateProperty extends ChangePropertyPrototype {
  constructor() {
    super('SocialCareStartDate');
    this._allowNull = true;
  }

  static clone() {
    return new WorkerSocialCareStartDateProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    const MAXIMUM_AGE = 100;
    const socialCareStartDate = document.socialCareStartDate;

    if (socialCareStartDate === undefined) {
      return;
    }

    if (socialCareStartDate === null) {
      this.property = null;
      return;
    }

    if (!START_DATE_TYPE.includes(socialCareStartDate.value)) {
      this.property = null;
      return;
    }

    if (socialCareStartDate.value === 'Yes') {
      const thisYear = new Date().getFullYear();

      if (
        socialCareStartDate.year &&
        Number.isInteger(socialCareStartDate.year) &&
        socialCareStartDate.year <= thisYear &&
        socialCareStartDate.year >= thisYear - MAXIMUM_AGE
      ) {
        this.property = {
          value: socialCareStartDate.value,
          year: socialCareStartDate.year,
        };
      } else {
        this.property = null;
      }

      return;
    }

    this.property = {
      value: socialCareStartDate.value,
    };
  }

  restorePropertyFromSequelize(document) {
    const yearStartedDocument = {
      value: document.SocialCareStartDateValue,
    };

    if (document.SocialCareStartDateValue === 'Yes' && document.SocialCareStartDateYear) {
      yearStartedDocument.year = document.SocialCareStartDateYear;
    }
    return yearStartedDocument;
  }
  savePropertyToSequelize() {
    if (!this.property) {
      return {
        SocialCareStartDateValue: null,
        SocialCareStartDateYear: null,
      };
    }

    return {
      SocialCareStartDateValue: this.property.value,
      SocialCareStartDateYear: this.property.value === 'Yes' ? this.property.year : null,
    };
  }

  isEqual(currentValue, newValue) {
    // not a simple (enum'd) string compare; if "Yes", also need to compare the year (just an integer)
    let yearEqual = false;
    if (currentValue && newValue && currentValue.value === 'Yes') {
      if (currentValue.year && newValue.year && currentValue.year === newValue.year) yearEqual = true;
    } else {
      yearEqual = true;
    }

    return currentValue && newValue && currentValue.value === newValue.value && yearEqual;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        socialCareStartDate: this.property,
      };
    }

    return {
      socialCareStartDate: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
