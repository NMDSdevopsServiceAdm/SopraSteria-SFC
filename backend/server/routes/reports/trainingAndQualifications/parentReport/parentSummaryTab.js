const lodash = require('lodash');
const { addText, setColourForRange, newBackgroundColours } = require('../../../../utils/excelUtils');

const generateParentSummaryTab = async (workbook, establishment, summaryTabData) => {
  const summaryTab = workbook.addWorksheet('Summary', { views: [{ showGridLines: false }] });
  const establishmentName = establishment.NameValue;

  addTitle(summaryTab, establishmentName);
  addBannerImage(workbook, summaryTab);

  addSummaryTable(summaryTab, summaryTabData);

  console.log(JSON.stringify(summaryTabData), '<------');

  setHeightAndWidths(summaryTab);
};

const addTitle = (tab, establishmentName) => {
  addText(tab, 'B2:I2', establishmentName, { size: 26, bold: true });
  addText(tab, 'B3:C3', 'Summary', { size: 24, bold: true });

  setColourForRange(tab, 'A2:AP3', { backgroundColour: newBackgroundColours.lightGrey });
};

const addBannerImage = (workbook, tab) => {
  tab.addImage(0, { tl: { col: 1, row: 0 }, ext: { width: 431, height: 62.4 } });
};

const setHeightAndWidths = (tab) => {
  const columnWidths = [6.83, 26.83, ...Array(24).fill(16.83)];
  const rowHeights = [45, 45, 45, 36, 36, 36];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
    column.alignment = { vertical: 'middle' };
  });

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });
};

const addSummaryTable = (tab, summaryTabData) => {
  addText(tab, 'B4', 'All staff', { size: 18, bold: true });

  subheadings.forEach(({ text, range }) => {
    addText(tab, range, text, { size: 12, bold: true });
  });

  const allColumnLabels = columnsToDisplay.map((column) => column.columnName);
  tab.addRow(['', ...allColumnLabels]);

  tab.addRow(['', 'All workplaces', '']);

  const fieldNames = columnsToDisplay.map((column) => column.field);

  summaryTabData.forEach((workplace) => {
    const rowData = lodash.at(workplace, fieldNames);
    tab.addRow(['', ...rowData]);
  });
};

const subheadings = [
  { text: 'All training records (could include staff flagged as long-term absent)', range: 'C5:F5' },
  { text: 'Mandatory training records', range: 'G5:K5' },
  { text: 'Non-mandatory training records', range: 'L5:O5' },
  { text: 'Care Certificates', range: 'P5:R5' },
  { text: 'L2 Adult Social Care Certificates', range: 'S5:U5' },
  { text: 'Social care qualification levels', range: 'V5:Z5' },
];

const columnsToDisplay = [
  { columnName: 'Workplace', field: 'workplaceName' },
  { columnName: 'Expired', field: 'trainingBreakdownTotals.expiredTrainingCount' },
  { columnName: 'Expiring soon', field: 'trainingBreakdownTotals.expiringTrainingCount' },
  // { columnName: 'Up-to-date', field: '' },
  // { columnName: 'Total', field: '' },
  // { columnName: 'Expired', field: '' },
  // { columnName: 'Expiring soon', field: '' },
  // { columnName: 'Up-to-date', field: '' },
  // { columnName: 'Total', field: '' },
  // { columnName: 'Missing records', field: '' },
  // { columnName: 'Expired', field: '' },
  // { columnName: 'Expiring soon', field: '' },
  // { columnName: 'Up-to-date', field: '' },
  // { columnName: 'Total', field: '' },
  // { columnName: 'Completed', field: '' },
  // { columnName: 'Started', field: '' },
  // { columnName: 'Not started', field: '' },
  // { columnName: 'Completed', field: '' },
  // { columnName: 'Started', field: '' },
  // { columnName: 'Not started', field: '' },
  // { columnName: 'Level 2 or higher', field: '' },
  // { columnName: 'Level 2', field: '' },
  // { columnName: 'Level 3', field: '' },
  // { columnName: 'Level 4', field: '' },
  // { columnName: 'Level 5 or above', field: '' },
];

module.exports = { generateParentSummaryTab };
