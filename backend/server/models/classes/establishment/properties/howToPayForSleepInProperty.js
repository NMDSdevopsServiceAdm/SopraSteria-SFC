const models = require('../../../index');
const { auditPropertyClassBuilder } = require('./auditPropertyBuilder');

const fieldName = 'howToPayForSleepIn';
const databaseColumnName = fieldName;

const classDef = auditPropertyClassBuilder({
  fieldName,
});

class HowToPayForSleepInProperty extends classDef {
  restoreFromJson(document) {
    const propertyInDocument = document[fieldName];

    if (propertyInDocument === null) {
      this.property = propertyInDocument;
    }

    // extract enum choices from sequelize model
    const allowedValues = models.establishment.rawAttributes[databaseColumnName].values;

    if (allowedValues.includes(propertyInDocument)) {
      this.property = propertyInDocument;
    }
  }
}

module.exports = { HowToPayForSleepInProperty };
