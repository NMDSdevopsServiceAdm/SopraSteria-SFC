const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.SharingPermissionsProperty = class SharingPermissionsProperty extends ChangePropertyPrototype {
  constructor() {
    super('SharingPermissions');
  }

  static clone() {
    return new SharingPermissionsProperty();
  }

  async restoreFromJson(document) {
    if ('showSharingPermissionsBanner' in document) {
      this.property = document.showSharingPermissionsBanner;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.showSharingPermissionsBanner;
  }

  savePropertyToSequelize() {
    return {
      showSharingPermissionsBanner: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      return {
        showSharingPermissionsBanner: this.property
      }
    }

    return {
      showSharingPermissionsBanner: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
