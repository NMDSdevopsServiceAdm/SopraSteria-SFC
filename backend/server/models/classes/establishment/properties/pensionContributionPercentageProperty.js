const { auditPropertyClassBuilder } = require('./auditPropertyBuilder');

const fieldName = 'pensionContributionPercentage';

const classDef = auditPropertyClassBuilder({
  fieldName,
});

class PensionContributionPercentageProperty extends classDef {
  async restoreFromJson(document) {
    const propertyInDocument = document[fieldName];

    if (propertyInDocument === null) {
      this.property = propertyInDocument;
    }

    const pensionContributionIsYes = document.pensionContribution === 'Yes';

    const parsedNumber = parseFloat(propertyInDocument);
    const isValidNumber = !isNaN(parsedNumber);
    const numberIsInRange = (3 <= parsedNumber) & (parsedNumber <= 100);

    if (pensionContributionIsYes && isValidNumber && numberIsInRange) {
      this.property = parsedNumber;
    }
  }
}

module.exports = { PensionContributionPercentageProperty };
