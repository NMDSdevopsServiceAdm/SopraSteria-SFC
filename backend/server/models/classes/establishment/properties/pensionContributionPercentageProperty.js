const { auditPropertyClassBuilder } = require('./auditPropertyBuilder');

const fieldName = 'pensionContributionPercentage';

const classDef = auditPropertyClassBuilder({
  fieldName,
});

class PensionContributionPercentageProperty extends classDef {
  restoreFromJson(document) {
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

// exports.PensionContributionPercentageProperty = class PensionContributionPercentage extends ChangePropertyPrototype {
//   constructor() {
//     super('PensionContributionPercentage');
//     this._allowNull = true;
//   }

//   get changePropertyDefaultName() {
//     return 'PensionContributionPercentage';
//   }

//   static clone() {
//     return new PensionContributionPercentage();
//   }

//   isEqual(currentValue, newValue) {
//     return currentValue === newValue;
//   }

//   restoreFromJson(document) {
//     const propertyInDocument = document.pensionContributionPercentage;
//     if (propertyInDocument === null) {
//       this.property = propertyInDocument;
//     }

//     const pensionContributionIsYes = document.pensionContribution === 'Yes';

//     const parsedNumber = parseFloat(propertyInDocument);
//     const isValidNumber = !isNaN(parsedNumber);
//     const numberIsInRange = (3 <= parsedNumber) & (parsedNumber <= 100);

//     if (pensionContributionIsYes && isValidNumber && numberIsInRange) {
//       this.property = parsedNumber;
//     }
//   }

//   restorePropertyFromSequelize(document) {
//     return document.pensionContributionPercentage;
//   }

//   savePropertyToSequelize() {
//     return {
//       pensionContributionPercentage: this.property ? this.property : null,
//     };
//   }

//   toJSON(withHistory = false, showPropertyHistoryOnly = true) {
//     if (!withHistory) {
//       return {
//         pensionContributionPercentage: this.property,
//       };
//     }

//     return {
//       pensionContributionPercentage: {
//         currentValue: this.property,
//         ...this.changePropsToJSON(showPropertyHistoryOnly),
//       },
//     };
//   }
// };
