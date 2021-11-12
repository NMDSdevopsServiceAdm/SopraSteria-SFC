// the "share with" property is a value (enum) property only, but stored as a set of individual properties (shareWithLA and shareWithCQC)
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.ShareWithProperty = class ShareWithProperty extends ChangePropertyPrototype {
  constructor() {
    super('ShareData');

    this._shareWithLA = null;
    this._shareWithCQC = null;
  }

  static clone() {
    return new ShareWithProperty();
  }

  async restoreFromJson(document) {
    if (document.shareWith) {
      this.property = document.shareWith;
    } else {
      this.property = null;
    }
  }

  restorePropertyFromSequelize(document) {
    return {
      cqc: document.shareWithCQC,
      localAuthorities: document.shareWithLA,
    };
  }

  savePropertyToSequelize() {
    return {
      shareWithCQC: this.property.cqc,
      shareWithLA: this.property.localAuthorities,
    };
  }

  isEqual(currentValue, newValue) {
    if (currentValue.cqc !== newValue.cqc) return false;
    if (currentValue.localAuthorities !== newValue.localAuthorities) return false;

    return true;
  }

  jsonShareOption() {
    const jsonResponse = {
      enabled: this.property.enabled,
    };

    if (this.property.with) {
      jsonResponse.with = this.property.with;
    } else {
      jsonResponse.with = [];
    }

    return jsonResponse;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        share: this.jsonShareOption(),
      };
    }

    return {
      share: {
        currentValue: this.jsonShareOption(),
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
