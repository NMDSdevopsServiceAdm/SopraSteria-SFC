const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const models = require('../../../index');

class TravelTimePayProperty extends ChangePropertyPrototype {
  constructor() {
    super('TravelTimePay');
    this._allowNull = true;
    this._isValid;
  }

  static clone() {
    return new TravelTimePayProperty();
  }

  async restoreFromJson(document) {
    const propertyInDocument = document.travelTimePay;

    if (!propertyInDocument) {
      return;
    }

    const travelTimePayOption = await models.travelTimePayOption.findByPk(propertyInDocument.id);

    if (!travelTimePayOption) {
      this.property = null;
      this._isValid = false;
      return;
    }

    if (!travelTimePayOption.includeRate) {
      this.property = {
        ...travelTimePayOption,
        rate: null,
      };
      return;
    }

    const parsedRate = parseFloat(propertyInDocument.rate);
    this.property = {
      ...travelTimePayOption,
      rate: parsedRate ? parsedRate : null,
    };
  }

  savePropertyToSequelize() {
    if (this.property) {
      return {
        TravelTimePayOptionFK: this.property.id,
        travelTimePayRate: this.property.rate,
      };
    } else {
      return {
        TravelTimePayOptionFK: null,
        travelTimePayRate: null,
      };
    }
  }

  isEqual(currentValue, newValue) {
    if (!currentValue || !newValue) return false;
    return currentValue?.id === newValue?.id && currentValue?.rate === newValue?.rate;
  }

  toJSON(withHistory = false) {
    if (!withHistory) {
      return {
        travelTimePay: this.property,
      };
    }

    return {
      travelTimePay: {
        currentValue: this.property,
      },
    };
  }

  restorePropertyFromSequelize(document) {
    const travelTimePayOption = document.travelTimePayOption;

    if (!travelTimePayOption || !travelTimePayOption.id) {
      return null;
    }

    if (!travelTimePayOption?.includeRate) {
      return { ...travelTimePayOption, rate: null };
    }

    const rate = document.travelTimePayRate;
    return { ...travelTimePayOption, rate };
  }
}

module.exports = { TravelTimePayProperty };
