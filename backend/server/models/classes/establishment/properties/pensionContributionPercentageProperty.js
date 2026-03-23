const { isUndefined } = require('lodash');
const { auditPropertyClassBuilder } = require('./auditPropertyBuilder');

const fieldName = 'pensionContributionPercentage';

const classDef = auditPropertyClassBuilder({
  fieldName,
});

class PensionContributionPercentageProperty extends classDef {
  async restoreFromJson(document) {
    const propertyInDocument = document[fieldName];

    if (isUndefined(document.pensionContribution)) {
      return;
    }

    const pensionContributionIsYes = document.pensionContribution === 'Yes';

    if (propertyInDocument === null || !pensionContributionIsYes) {
      this.property = null;
      return;
    }

    const parsedNumber = parseFloat(propertyInDocument);
    const isValidNumber = !isNaN(parsedNumber);
    const numberIsInRange = (3 <= parsedNumber) & (parsedNumber <= 100);

    if (isValidNumber && numberIsInRange) {
      this.property = parsedNumber;
    }
  }
}

module.exports = { PensionContributionPercentageProperty };
