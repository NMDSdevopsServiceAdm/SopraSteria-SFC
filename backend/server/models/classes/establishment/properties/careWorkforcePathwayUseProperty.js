const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const models = require('../../../index');

const [YES, NO, DONT_KNOW, NULL] = ['Yes', 'No', "Don't know", null];

exports.CareWorkforcePathwayUseProperty = class CareWorkforcePathwayUseProperty extends ChangePropertyPrototype {
  constructor() {
    super('CareWorkforcePathwayUse');
    this._allowNull = true;
    this._isValid;
  }

  static clone() {
    return new CareWorkforcePathwayUseProperty();
  }

  async restoreFromJson(document) {
    const propertyInDocument = document.careWorkforcePathwayUse;

    if (!propertyInDocument) {
      return;
    }

    switch (propertyInDocument.use) {
      case YES: {
        const reasons = await this._validateReasons(propertyInDocument.reasons);
        this.property = {
          use: YES,
          reasons,
        };
        return;
      }

      case NULL:
      case NO:
      case DONT_KNOW: {
        this.property = {
          use: propertyInDocument.use,
          reasons: null,
        };
        return;
      }

      default: {
        this.property = null;
        this._isValid = false;
      }
    }
  }

  get valid() {
    if (!super.valid) {
      return false;
    }
    return this._isValid ?? true;
  }

  async _validateReasons(reasons) {
    if (!reasons || !Array.isArray(reasons) || reasons.length < 1) {
      return null;
    }
    const reasonIds = reasons.map((reason) => reason.id);

    const validReasonsFound = await models.CareWorkforcePathwayReasons.findAll({
      attributes: ['id', 'text', 'isOther'],
      where: { id: reasonIds },
      order: [['seq', 'ASC']],
      raw: true,
    });

    if (validReasonsFound.length !== reasons.length) {
      this._isValid = false;
      return null;
    }

    validReasonsFound.forEach((reason) => {
      if (reason.isOther) {
        const otherText = reasons.find((r) => r.id === reason.id)?.other;
        reason.other = otherText;
      }
    });

    return validReasonsFound;
  }

  restorePropertyFromSequelize(sequelizeDocument) {
    const cwpUse = sequelizeDocument.careWorkforcePathwayUse;

    switch (cwpUse) {
      case YES: {
        const reasons = sequelizeDocument.careWorkforcePathwayReasons?.map((reason) => this._formatReason(reason));

        return {
          use: 'Yes',
          reasons: reasons?.length ? reasons : null,
        };
      }

      case NO:
      case DONT_KNOW: {
        return {
          use: cwpUse,
          reasons: null,
        };
      }

      case null:
        return null;
    }
  }

  _formatReason(rawReasonObject) {
    const { id, text, isOther, other } = rawReasonObject;
    const formatted = { id, text, isOther };
    if (isOther) {
      formatted.other = other;
    }

    return formatted;
  }

  savePropertyToSequelize() {
    if (!this.property) {
      return {
        careWorkforcePathwayUse: this.property,
        additionalModels: {
          EstablishmentCWPReasons: [],
        },
      };
    }

    const { use, reasons } = this.property;

    if ([NO, DONT_KNOW].includes(use) || !Array.isArray(reasons)) {
      return {
        careWorkforcePathwayUse: use,
        additionalModels: {
          EstablishmentCWPReasons: [],
        },
      };
    }

    const establishmentCWPReasons = reasons.map((reason) => {
      return {
        careWorkforcePathwayReasonID: reason.id,
        ...(reason.other ? { other: reason.other } : {}),
      };
    });

    return {
      careWorkforcePathwayUse: use,
      additionalModels: {
        EstablishmentCWPReasons: establishmentCWPReasons,
      },
    };
  }

  isEqual(currentValue, newValue) {
    if (!currentValue?.use || !newValue?.use) {
      return currentValue === newValue;
    }

    switch (currentValue.use) {
      case NO:
      case DONT_KNOW: {
        return currentValue.use === newValue.use;
      }
      case YES: {
        if (currentValue.use !== newValue.use) {
          return false;
        }

        return this._compareReasons(currentValue.reasons, newValue.reasons);
      }

      default: {
        return false;
      }
    }
  }

  _compareReasons(currentReasons, newReasons) {
    if (!Array.isArray(currentReasons) || !Array.isArray(newReasons)) {
      return currentReasons === newReasons;
    }

    if (currentReasons.length !== newReasons.length) {
      return false;
    }

    const allReasonsMatches = newReasons.every((newValueReason) => {
      return currentReasons.some(
        (currValueReason) => newValueReason.id === currValueReason.id && newValueReason.other === currValueReason.other,
      );
    });

    return allReasonsMatches;
  }

  toJSON(withHistory = false) {
    if (!withHistory) {
      return {
        careWorkforcePathwayUse: this.property,
      };
    }

    return {
      careWorkforcePathwayUse: {
        currentValue: this.property,
      },
    };
  }
};
