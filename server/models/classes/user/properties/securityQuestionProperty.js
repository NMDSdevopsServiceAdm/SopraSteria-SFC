// the Security Question property is a value only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.UserSecurityQuestionProperty = class UserSecurityQuestionProperty extends ChangePropertyPrototype {
  constructor() {
    super('SecurityQuestion');
  }

  static clone() {
    return new UserSecurityQuestionProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    // Security Question must be non-empty and must be no more than 120 character

    if (document.securityQuestion) {
      const SECURITY_QUESTION_MAX_LENGTH = 255;
      if (document.securityQuestion.length > 0 && document.securityQuestion.length <= SECURITY_QUESTION_MAX_LENGTH) {
        this.property = document.securityQuestion;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.SecurityQuestionValue;
  }
  savePropertyToSequelize() {
    return {
      SecurityQuestionValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // Security Question is a simple string
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        securityQuestion: this.property,
      };
    }

    return {
      securityQuestion: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
