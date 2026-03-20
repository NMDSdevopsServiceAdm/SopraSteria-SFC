const { auditPropertyClassBuilder } = require('./auditPropertyBuilder');

const fieldName = 'pensionContribution';

const classDef = auditPropertyClassBuilder({
  fieldName,
});

class PensionContributionProperty extends classDef {
  async restoreFromJson(document) {
    const propertyInDocument = document[fieldName];

    if (propertyInDocument === null) {
      this.property = propertyInDocument;
    }
    const allowedValues = ['Yes', 'No', "Don't know"];

    if (allowedValues.includes(propertyInDocument)) {
      this.property = propertyInDocument;
    }
  }
}

module.exports = { PensionContributionProperty };
