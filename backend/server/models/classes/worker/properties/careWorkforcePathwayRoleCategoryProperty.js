const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

exports.CareWorkforcePathwayRoleCategoryProperty = class CareWorkforcePathwayRoleCategoryProperty extends (
  ChangePropertyPrototype
) {
  constructor() {
    super('CareWorkforcePathwayRoleCategory');
    this._allowNull = true;
  }

  static clone() {
    return new CareWorkforcePathwayRoleCategoryProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    if (document.careWorkforcePathwayRoleCategory || document.careWorkforcePathwayRoleCategory === null) {
      if (document.careWorkforcePathwayRoleCategory) {
        this.property = document.careWorkforcePathwayRoleCategory;
      } else {
        this.property = null;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    if (document.careWorkforcePathwayRoleCategory) {
      return {
        roleCategoryId: document.careWorkforcePathwayRoleCategory.id,
        title: document.careWorkforcePathwayRoleCategory.title,
        description: document.careWorkforcePathwayRoleCategory.description,
      };
    }
  }

  savePropertyToSequelize() {
    const fkValue = this.property === null ? null : this.property.roleCategoryId;

    return {
      CareWorkforcePathwayRoleCategoryFK: fkValue,
    };
  }

  isEqual(currentValue, newValue) {
    return currentValue && newValue && currentValue.roleCategoryId === newValue.roleCategoryId;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true) {
    if (!withHistory) {
      // simple form
      return {
        careWorkforcePathwayRoleCategory: this.property,
      };
    }

    return {
      careWorkforcePathwayRoleCategory: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }
};
