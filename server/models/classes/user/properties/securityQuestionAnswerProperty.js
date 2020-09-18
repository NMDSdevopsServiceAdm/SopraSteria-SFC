// the Security Question Answer property is a value only
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.UserSecurityQuestionAnswerProperty = class UserSecurityQuestionAnswerProperty extends ChangePropertyPrototype {
  constructor() {
    super('SecurityQuestionAnswer');
  }

  static clone() {
    return new UserSecurityQuestionAnswerProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    // Security Question Answer must be non-empty and must be no more than 120 character

    if (document.securityQuestionAnswer) {
      const SECURITY_QUESTION_MAX_LENGTH = 255;
      if (
        document.securityQuestionAnswer.length > 0 &&
        document.securityQuestionAnswer.length <= SECURITY_QUESTION_MAX_LENGTH
      ) {
        this.property = document.securityQuestionAnswer;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.SecurityQuestionAnswerValue;
  }
  savePropertyToSequelize() {
    return {
      SecurityQuestionAnswerValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // Security Question Answer is a simple string
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        securityQuestionAnswer: this.property,
      };
    }

    return {
      securityQuestionAnswer: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
