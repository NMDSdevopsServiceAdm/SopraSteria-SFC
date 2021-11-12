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
    // share data is a simple object - need to compare "enabled" and "with" attributes (the latter being an array)
    let shareWithOptionsEqual = true;

    if (currentValue && newValue && currentValue.enabled && newValue.enabled) {
      if (currentValue.with && newValue.with) {
        // current and new are both enabled
        if (currentValue.with.length != newValue.with.length) {
          // not the same length, so not equal
          shareWithOptionsEqual = false;
        } else {
          // check every value in current is in new
          shareWithOptionsEqual = currentValue.with.every((thisCurrentWithOption) => {
            return newValue.with.find((thisNewWithOption) => thisNewWithOption === thisCurrentWithOption);
          });
        }
      }
    }

    return (
      currentValue !== null && newValue !== null && currentValue.enabled === newValue.enabled && shareWithOptionsEqual
    );
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
