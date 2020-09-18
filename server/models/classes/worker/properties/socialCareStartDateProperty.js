// the Social Care Start Date property is an enumeration and optional value; that value is a date, moreso, just the year part
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const START_DATE_TYPE = ['Yes', 'No'];
exports.WorkerSocialCareStartDateProperty = class WorkerSocialCareStartDateProperty extends ChangePropertyPrototype {
  constructor() {
    super('SocialCareStartDate');
  }

  static clone() {
    return new WorkerSocialCareStartDateProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    const MAXIMUM_AGE = 100;

    if (document.socialCareStartDate) {
      if (START_DATE_TYPE.includes(document.socialCareStartDate.value)) {
        if (document.socialCareStartDate.value === 'Yes') {
          const thisYear = new Date().getFullYear();

          // need to validate the year - it's only four character integer - YYYY
          // it has to be less than equal to this year
          // it cannot be less than MAXIMUM AGE

          // TODO - cross validation checks against Date of Birth
          if (
            document.socialCareStartDate.year &&
            Number.isInteger(document.socialCareStartDate.year) &&
            document.socialCareStartDate.year <= thisYear &&
            document.socialCareStartDate.year >= thisYear - MAXIMUM_AGE
          ) {
            this.property = {
              value: document.socialCareStartDate.value,
              year: document.socialCareStartDate.year,
            };
          } else {
            // invalid year of start
            this.property = null;
          }
        } else {
          // simple year starterd property
          this.property = {
            value: document.socialCareStartDate.value,
          };
        }
      } else {
        this.property = null;
      }
    }
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
