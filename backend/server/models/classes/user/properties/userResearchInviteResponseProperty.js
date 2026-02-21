// the UserResearchInviteResponseAccepted property has a value of Yes / No / null
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.UserUserResearchInviteResponseProperty = class UserUserResearchInviteResponseProperty extends ChangePropertyPrototype {
  constructor() {
    super('UserResearchInviteResponse');
    this._allowNull = true;
  }

  static clone() {
    return new UserUserResearchInviteResponseProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    this.property = document.userResearchInviteResponse;
  }

  restorePropertyFromSequelize(document) {
    return document.UserResearchInviteResponseValue;
  }

  savePropertyToSequelize() {
    return {
      UserResearchInviteResponseValue: this.property
    };
  }

  isEqual(currentValue, newValue) {
    // a simple enum string compare
    return currentValue === newValue;
  }

  toJSON(withHistory=false, showPropertyHistoryOnly=true) {
    if (!withHistory) {
      return {
        userResearchInviteResponse: this.property
      };
    }

    return {
      userResearchInviteResponse: {
        currentValue: this.property,
        ... this.changePropsToJSON(showPropertyHistoryOnly)
      }
    };
  }
};
