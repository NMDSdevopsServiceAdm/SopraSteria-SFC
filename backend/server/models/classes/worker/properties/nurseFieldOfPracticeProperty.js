const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const models = require('../../../index');

exports.NurseFieldOfPracticeProperty = class NurseFieldOfPracticeProperty extends ChangePropertyPrototype {
  constructor() {
    super('NurseFieldOfPractice');
    this._allowNull = true;
  }

  static clone() {
    return new NurseFieldOfPracticeProperty();
  }

  async restoreFromJson(document) {
    const propertyInDocument = document.nurseFieldOfPractice;

    if (!propertyInDocument === undefined) {
      return;
    }

    const fields = await this._validateFieldOfPractice(propertyInDocument);

    this.property = fields;
    return;
  }

  async _validateFieldOfPractice(fields) {
    if (!fields || !Array.isArray(fields) || !fields?.length) {
      return null;
    }
    const fieldIds = fields.map((field) => field.id);

    const validFieldsFound = await models.NurseFieldOfPractice.findAll({
      attributes: ['id', 'label'],
      where: { id: fieldIds },
      order: [['seq', 'ASC']],
      raw: true,
    });

    if (fieldIds.length !== fieldIds.length) {
      this._isValid = false;
      return null;
    }

    return validFieldsFound;
  }

  savePropertyToSequelize() {
    if (this.property?.length) {
      const items = this.property.map((field) => {
        return { nurseFieldOfPracticeID: field.id };
      });
      return {
        additionalModels: { WorkerNurseFieldsOfPractice: items },
      };
    }

    return {
      additionalModels: { WorkerNurseFieldsOfPractice: [] },
    };
  }

  isEqual(currentValue, newValue) {
    if (!Array.isArray(currentValue) || !Array.isArray(newValue)) {
      return currentValue === newValue;
    }

    if (currentValue.length !== newValue.length) {
      return false;
    }

    const allFieldsMatches = newValue.every((newValueField) => {
      return currentValue.some((currentValueField) => newValueField.id === currentValueField.id);
    });

    return allFieldsMatches;
  }

  toJSON(withHistory = false) {
    if (!withHistory) {
      return {
        nurseFieldOfPractice: this.property,
      };
    }

    return {
      nurseFieldOfPractice: {
        currentValue: this.property,
      },
    };
  }

  restorePropertyFromSequelize(document) {
    if (document.nurseFieldOfPractice && document.nurseFieldOfPractice?.length > 0) {
      return document.nurseFieldOfPractice.map((field) => ({ id: field.id, label: field.label }));
    }

    return null;
  }
};
