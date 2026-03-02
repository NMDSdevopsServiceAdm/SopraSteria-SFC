// the offerSleepIn property is an enumeration
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const OFFER_SLEEP_IN_TYPE = ['Yes', 'No', "Don't know"];
exports.OfferSleepInProperty = class OfferSleepInProperty extends ChangePropertyPrototype {
  constructor() {
    super('OfferSleepIn');
    this._allowNull = true;
  }

  static clone() {
    return new OfferSleepInProperty();
  }

  async restoreFromJson(document) {
    const propertyInDocument = document.offerSleepIn;

    if (OFFER_SLEEP_IN_TYPE.includes(propertyInDocument)) {
      this.property = propertyInDocument;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.offerSleepIn;
  }

  savePropertyToSequelize() {
    return {
      OfferSleepInValue: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    if (currentValue == null || newValue == null) return false;
    return currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      return {
        offerSleepIn: this.property,
      };
    }

    return {
      offerSleepIn: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
