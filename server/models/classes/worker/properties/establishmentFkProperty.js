const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.EstablishmentFkProperty = class EstablishmentFkProperty extends ChangePropertyPrototype {
  constructor() {
    super('EstablishmentFk');
  }

  static clone() {
    return new EstablishmentFkProperty();
  }

  async restoreFromJson(document) {
    if (document.establishmentFk) {
      this.property = document.establishmentFk;
    }
  }

  restorePropertyFromSequelize(document) {
    return document.EstablishmentFk;
  }

  savePropertyToSequelize() {
    return {
      establishmentFk: this.property,
    };
  }

  isEqual(currentValue, newValue) {
    return currentValue && newValue && currentValue === newValue;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        establishmentFk: this.property,
      };
    }

    return {
      establishmentFk: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
