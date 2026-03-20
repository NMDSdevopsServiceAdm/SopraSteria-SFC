const lodash = require('lodash');
const ChangePropertyPrototype = require('../../properties/changePrototype').ChangePropertyPrototype;

const auditPropertyClassBuilder = ({ fieldName, propertyName, propertyPrefix, databaseColumnName }) => {
  propertyPrefix = propertyPrefix ?? lodash.upperFirst(fieldName);
  propertyName = propertyName ?? lodash.upperFirst(fieldName);
  databaseColumnName = databaseColumnName ?? fieldName;

  class AuditPropertyBaseClass extends ChangePropertyPrototype {
    constructor() {
      super(propertyName, propertyPrefix);
      this._allowNull = true;
    }

    get changePropertyDefaultName() {
      return propertyPrefix;
    }

    static clone() {
      return new this();
    }

    isEqual(currentValue, newValue) {
      return currentValue === newValue;
    }

    async restoreFromJson(_document) {
      throw new Error('to be implemented in each property class');
    }

    restorePropertyFromSequelize(document) {
      return document[databaseColumnName] ?? null;
    }

    savePropertyToSequelize() {
      return {
        [databaseColumnName]: this.property ? this.property : null,
      };
    }

    toJSON(withHistory = false, showPropertyHistoryOnly = true) {
      if (!withHistory) {
        return {
          [fieldName]: this.property,
        };
      }

      return {
        [fieldName]: {
          currentValue: this.property,
          ...this.changePropsToJSON(showPropertyHistoryOnly),
        },
      };
    }
  }

  return AuditPropertyBaseClass;
};

module.exports = { auditPropertyClassBuilder };
