const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;
const validValues = [true, false];

exports.UserCanManageWdfClaimsProperty = class UserCanManageWdfClaimsProperty extends ChangePropertyPrototype {
  constructor() {
    super('CanManageWdfClaims');
  }

  static clone() {
    return new UserCanManageWdfClaimsProperty();
  }

  async restoreFromJson(document) {
    if (validValues.includes(document.canManageWdfClaims)) {
      this.property = document.canManageWdfClaims;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.canManageWdfClaims;
  }

  savePropertyToSequelize() {
    return {
      canManageWdfClaims: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    return validValues.includes(newValue) && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      return {
        canManageWdfClaims: this.property,
      };
    }

    return {
      canManageWdfClaims: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
