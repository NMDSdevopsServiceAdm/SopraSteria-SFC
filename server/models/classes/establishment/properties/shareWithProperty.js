// the "share with" property is a value (enum) property only, but stored as a set of individual properties (shareWithLA and shareWithCQC)
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const OPTION_LOCAL_AUTHORITY = 'Local Authority';
const OPTION_CQC = 'CQC';

exports.ShareWithProperty = class ShareWithProperty extends ChangePropertyPrototype {
  constructor() {
    super('ShareData');

    this._shareWithLA = null;
    this._shareWithCQC = null;
  }

  static clone() {
    return new ShareWithProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.shareWith) {
      this.property = document.shareWith;
    } else {
      this.property = null;
    }
  }

  restorePropertyFromSequelize(document) {
    if (document.ShareDataValue) {
      const shareWith = [];

      if (document.shareWithCQC) shareWith.push(OPTION_CQC);
      if (document.shareWithLA) shareWith.push(OPTION_LOCAL_AUTHORITY);

      return {
        enabled: true,
        with: shareWith,
      };
    } else {
      // even if sharing if not enabled, cache (private) the share with CQC
      //  and share with LA options, in case when serialising from JSON
      //  we're toggling back on sharing
      this._shareWithLA = document.shareWithLA;
      this._shareWithCQC = document.shareWithCQC;
      return {
        enabled: false,
      };
    }
  }
  savePropertyToSequelize() {
    const updateDocument = {
      ShareDataValue: this.property.enabled,
    };

    // only update the with options is share is enabled
    if (this.property.enabled) {
      // note - must reset the specific share option if it is not in the with set
      if (this.property.with) {
        if (this.property.with.includes(OPTION_CQC)) {
          updateDocument.shareWithCQC = true;
        } else {
          updateDocument.shareWithCQC = false;
        }
        if (this.property.with.includes(OPTION_LOCAL_AUTHORITY)) {
          updateDocument.shareWithLA = true;
        } else {
          updateDocument.shareWithLA = false;
        }
      }
    }

    return updateDocument;
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
