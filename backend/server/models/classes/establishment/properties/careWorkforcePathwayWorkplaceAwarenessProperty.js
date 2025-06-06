const { ChangePropertyPrototype } = require('../../properties/changePrototype');

exports.CareWorkforcePathwayWorkplaceAwarenessProperty = class CareWorkforcePathwayWorkplaceAwarenessProperty extends (
  ChangePropertyPrototype
) {
  constructor() {
    super('careWorkforcePathwayWorkplaceAwareness');
    this._allowNull = true;
  }

  static clone() {
    return new CareWorkforcePathwayWorkplaceAwarenessProperty();
  }

  async restoreFromJson(document) {
    if (document.careWorkforcePathwayWorkplaceAwareness) {
      this.property = document.careWorkforcePathwayWorkplaceAwareness;
    } else {
      this.property = null;
    }
  }

  restorePropertyFromSequelize(document) {
    if (document.careWorkforcePathwayWorkplaceAwareness) {
      return {
        id: document.careWorkforcePathwayWorkplaceAwareness.id,
        title: document.careWorkforcePathwayWorkplaceAwareness.title,
      };
    }
  }

  savePropertyToSequelize() {
    return {
      CareWorkforcePathwayWorkplaceAwarenessFK: this.property === null ? null : this.property.id,
    };
  }

  isEqual(currentValue, newValue) {
    return currentValue && newValue && currentValue.id === newValue.id;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      return {
        careWorkforcePathwayWorkplaceAwareness: this.property,
      };
    }

    return {
      careWorkforcePathwayWorkplaceAwareness: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
