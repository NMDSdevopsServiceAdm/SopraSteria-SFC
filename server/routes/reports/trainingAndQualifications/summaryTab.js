const { addHeading, addLine } = require('../../../utils/excelUtils');

const generateSummaryTab = (workbook) => {
  const summaryTab = workbook.addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });

  addHeading(summaryTab, 'B2', 'E2', 'Training (summary)');
  addLine(summaryTab, 'A4', 'E4');
};

module.exports.generateSummaryTab = generateSummaryTab;
