// the Job title property is a value only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.UserJobTitleProperty = class UserJobTitleProperty extends ChangePropertyPrototype {
  constructor() {
    super('JobTitle');
  }

  static clone() {
    return new UserJobTitleProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    // job title must be non-empty and must be no more than 120 character

    if (document.jobTitle) {
      const JOB_TITLE_MAX_LENGTH = 120;
      if (document.jobTitle.length > 0 && document.jobTitle.length <= JOB_TITLE_MAX_LENGTH) {
        this.property = document.jobTitle;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.JobTitleValue;
  }
  savePropertyToSequelize() {
    return {
      JobTitleValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // Job Title is a simple string
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        jobTitle: this.property,
      };
    }

    return {
      jobTitle: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
