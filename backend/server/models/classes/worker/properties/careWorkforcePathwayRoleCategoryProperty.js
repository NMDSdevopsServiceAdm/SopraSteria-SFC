// database models
const lodash = require('lodash');
const { CWPRoleCategoryGroup } = require('../../../../data/constants');
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
    if (document.careWorkforcePathwayRoleCategory === null) {
      this.property = null;
      return;
    }

    if (document.careWorkforcePathwayRoleCategory) {
      const restoredProperty = await this.getRoleCategoryFromDatabase(document.careWorkforcePathwayRoleCategory);

      if (
        document?.careWorkforcePathwayRoleCategory?.isNominatedIndividual &&
        isSeniorLeadershipGroup(restoredProperty)
      ) {
        restoredProperty.isNominatedIndividual = true;
      }

      if (restoredProperty) {
        this.property = restoredProperty;
      }
    }
  }

  restorePropertyFromSequelize(document) {
    if (document.careWorkforcePathwayRoleCategory === null) {
      return null;
    }
    if (!document.careWorkforcePathwayRoleCategory) {
      return;
    }

    const isNominatedIndividual =
      isSeniorLeadershipGroup(document.careWorkforcePathwayRoleCategory) &&
      document.CWPRoleCategoryIsAlsoNominatedIndividual;

    const { id, title, description, group } = document.careWorkforcePathwayRoleCategory;

    const property = { roleCategoryId: id, title, description, group };

    if (isNominatedIndividual) {
      property.isNominatedIndividual = true;
    }

    return property;
  }

  savePropertyToSequelize() {
    const fkValue = this.property === null ? null : this.property.roleCategoryId;
    const isNominatedIndividual = this.property?.isNominatedIndividual ?? false;

    return {
      CareWorkforcePathwayRoleCategoryFK: fkValue,
      CWPRoleCategoryIsAlsoNominatedIndividual: isNominatedIndividual,
    };
  }

  isEqual(currentValue, newValue) {
    return (
      currentValue &&
      newValue &&
      currentValue.roleCategoryId === newValue.roleCategoryId &&
      currentValue.isNominatedIndividual === newValue.isNominatedIndividual
    );
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

  async getRoleCategoryFromDatabase(payloadData) {
    const roleCategory = await models.careWorkforcePathwayRoleCategory.findByPk(payloadData?.roleCategoryId, {
      raw: true,
    });

    if (roleCategory) {
      return renameIdToRoleCategoryId(roleCategory);
    }

    return null;
  }
};

const isSeniorLeadershipGroup = (roleCategory) => roleCategory?.group === CWPRoleCategoryGroup.SeniorLeadership;

const renameIdToRoleCategoryId = (roleCategory) => {
  if (!roleCategory) {
    return roleCategory;
  }
  return { ...lodash.omit(roleCategory, 'id'), roleCategoryId: roleCategory.id };
};
