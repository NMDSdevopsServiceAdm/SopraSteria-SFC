// the email property is a value Rolenly
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.UserRoleProperty = class UserRoleProperty extends ChangePropertyPrototype {
  constructor() {
    super('UserRole');
  }

  static clone() {
    return new UserRoleProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.role) {
      const ALLOWED_ROLES = ['Read', 'Edit'];
      if (ALLOWED_ROLES.includes(document.role)) {
        this.property = document.role;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.UserRoleValue;
  }
  savePropertyToSequelize() {
    return {
      UserRoleValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // email is a simple string
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        role: this.property,
      };
    }

    return {
      role: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
