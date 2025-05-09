// database models
const models = require('../../../index');
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

  async restoreFromJson(document) {
    if (document.careWorkforcePathwayRoleCategory) {
      const validatedData = await this._validateOrigin(document.careWorkforcePathwayRoleCategory);

      if (validatedData) {
        this.property = validatedData;
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

  async _validateOrigin(payloadData) {
    let roleCategory = null;
    if (payloadData.roleCategoryId) {
      roleCategory = await models.careWorkforcePathwayRoleCategory.findOne({
        where: {
          id: payloadData.roleCategoryId,
        },
        attributes: ['id', 'title', 'description'],
      });
    }

    if (roleCategory && roleCategory.id) {
      // found a roleCategory match
      return {
        roleCategoryId: roleCategory.id,
        title: roleCategory.title,
        description: roleCategory.description,
      };
    } else {
      return false;
    }
  }
};
