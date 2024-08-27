// the level 2 care certificate property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const LEVEL_2_CARE_CERTIFICATE_TYPE = ['Yes, completed', 'Yes, started', 'No'];
exports.Level2CareCertificateProperty = class Level2CareCertificateProperty extends ChangePropertyPrototype {
  constructor() {
    super('Level2CareCertificate');
  }

  static clone() {
    return new Level2CareCertificateProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.careCertificate) {
      if (LEVEL_2_CARE_CERTIFICATE_TYPE.includes(document.level2CareCertificate)) {
        this.property = document.level2CareCertificate;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    return document.Level2CareCertificateValue;
  }
  savePropertyToSequelize() {
    return {
      Level2CareCertificateValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    // Level 2 Care Certificate is a simple (enum'd) string
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true, wdfEffectiveDate = false) {
    if (wdfEffectiveDate) {
      return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
    }

    if (!withHistory) {
      // simple form
      return {
        level2CareCertificate: this.property,
      };
    }

    return {
      level2CareCertificate: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
