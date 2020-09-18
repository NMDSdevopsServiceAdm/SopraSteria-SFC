// the Recruited From property is a type being both a local value and a lookup on 'Yes' having RecruitedFrom Id and From
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

// database models
const models = require('../../../index');

const KNOWN_ORIGINS = ['Yes', 'No'];
exports.WorkerRecruitedFromProperty = class WorkerRecruitedFromProperty extends ChangePropertyPrototype {
  constructor() {
    super('RecruitedFrom');
  }

  static clone() {
    return new WorkerRecruitedFromProperty();
  }

  // concrete implementations
  async restoreFromJson(document) {
    // it's a little more than assuming the JSON representation
    // There is the Worker value, and an additional lookup against Recruited From if the local value is "Yes"
    if (document.recruitedFrom) {
      if (KNOWN_ORIGINS.includes(document.recruitedFrom.value)) {
        // if the given origin is "Yes", then need to resolve on the given origin (from)
        if (document.recruitedFrom.value === 'Yes') {
          const validatedOrigin = await this._validateOrigin(document.recruitedFrom.from);

          if (validatedOrigin) {
            this.property = {
              value: document.recruitedFrom.value,
              from: {
                recruitedFromId: validatedOrigin.recruitedFromId,
                from: validatedOrigin.from,
              },
            };
          } else {
            // invalid recruitment origin defintion - fails
            this.property = null;
          }
        } else {
          this.property = {
            value: document.recruitedFrom.value,
          };
        }
      } else {
        this.property = null;
      }
    }
  }
  restorePropertyFromSequelize(document) {
    // There is the Worker value, and an additional lookup against RecruitedFrom if the local value is "Yes"
    if (document.RecruitedFromValue) {
      const origin = {
        value: document.RecruitedFromValue,
      };

      if (document.RecruitedFromValue === 'Yes' && document.recruitedFrom) {
        origin.from = {
          recruitedFromId: document.recruitedFrom.id,
          from: document.recruitedFrom.from,
        };
      }
      return origin;
    }
  }
  savePropertyToSequelize() {
    // Recruited From is more than just a value or an fk; it can be both, if the value is 'Yes'
    const originRecord = {
      RecruitedFromValue: this.property.value,
    };

    if (this.property.value === 'Yes') {
      originRecord.RecruitedFromOtherFK = this.property.from.recruitedFromId;
    } else {
      // reset other recruited from lookup if not Yes
      originRecord.RecruitedFromOtherFK = null;
    }
    return originRecord;
  }

  isEqual(currentValue, newValue) {
    // Recruited From is an object having value and optional Recruited From lookup (by id)
    let originEqual = false;
    if (currentValue && newValue && currentValue.value === 'Yes') {
      if (currentValue.from && newValue.from && currentValue.from.recruitedFromId == newValue.from.recruitedFromId) {
        originEqual = true;
      }
    } else {
      originEqual = true;
    }

    return currentValue && newValue && currentValue.value === newValue.value && originEqual;
  }

  toJSON(withHistory = false, showPropertyHistoryOnly = true, wdfEffectiveDate = false) {
    if (wdfEffectiveDate) {
      return this._savedAt ? this._savedAt > wdfEffectiveDate : false;
    }

    if (!withHistory) {
      // simple form
      return {
        recruitedFrom: this.property,
      };
    }

    return {
      recruitedFrom: {
        currentValue: this.property,
        ...this.changePropsToJSON(showPropertyHistoryOnly),
      },
    };
  }

  _valid(originDef) {
    if (!originDef) return false;

    // must exist a recruitedFromId or from
    if (!(originDef.recruitedFromId || originDef.from)) return false;

    // if recruitedFromId is given, it must be an integer
    if (originDef.recruitedFromId && !Number.isInteger(originDef.recruitedFromId)) return false;

    // gets here, and it's valid
    return true;
  }

  // returns false if Recruited From (origin) definition is not valid, otherwise returns
  //  a well formed Recruited From definition using data as given in from reference lookup
  async _validateOrigin(originDef) {
    if (!this._valid(originDef)) return false;

    // recruitedFromId overrides from, because recruitedFromId is indexed whereas from is not!
    let referenceOrigin = null;
    if (originDef.recruitedFromId) {
      referenceOrigin = await models.recruitedFrom.findOne({
        where: {
          id: originDef.recruitedFromId,
        },
        attributes: ['id', 'from'],
      });
    } else {
      referenceOrigin = await models.recruitedFrom.findOne({
        where: {
          from: originDef.from,
        },
        attributes: ['id', 'from'],
      });
    }

    if (referenceOrigin && referenceOrigin.id) {
      // found a recruited from match
      return {
        recruitedFromId: referenceOrigin.id,
        from: referenceOrigin.from,
      };
    } else {
      return false;
    }
  }
};
