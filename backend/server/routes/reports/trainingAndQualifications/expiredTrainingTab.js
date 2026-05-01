const {
  addHeading,
  newBackgroundColours,
  newTextColours,
  addLink,
  borderStyles,
  addText,
  setColourForRange,
} = require('../../../utils/excelUtils');

const generateExpiredTrainingTab = async (workbook, establishmentsTrainingRecords, isParent = false) => {
  const expiredTrainingTab = workbook.addWorksheet('Expired training', { views: [{ showGridLines: false }] });

  // addTitle;
};

module.exports = { generateExpiredTrainingTab };
