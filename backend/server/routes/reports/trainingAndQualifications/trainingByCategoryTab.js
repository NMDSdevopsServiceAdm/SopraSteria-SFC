const { convertTrainingForEstablishments } = require('../../../utils/trainingAndQualificationsUtils');
const {
  addText,
  setColourForRange,
  newBackgroundColours,
  newTextColours,
  conditionalColoursForTrainingExpiry,
  setColourForCell,
  setBasicTableStyle,
  tableHeaderCellStyle,
  borderStyles,
  applyStyleToRange,
  autoFitColumnWidthByTextLength,
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const colCache = require('exceljs/lib/utils/col-cache');
const lodash = require('lodash');

const GroupHeaderRowNumber = 3;
const HeaderRowNumber = 4;

const columnNameAndDataFields = [
  { columnName: 'Training category', field: 'category' },
  { columnName: 'Workplace', field: 'workplaceName' },
  { columnName: 'Mandatory', field: 'isMandatory' },
  { columnName: 'Total', field: 'trainingCount' },
  { columnName: 'Expired', field: 'expiredNonMandatoryTrainingCount' },
  { columnName: 'Expiring soon', field: '' },
  { columnName: 'Up-to-date', field: '' },
  { columnName: 'Missing', field: 'missingMandatoryTrainingCount' },
];

const generateTrainingByCategoryTab = async (workbook, trainingByCategoryBreakdowns, isParent = false) => {
  const trainingByCategoryTab = workbook.addWorksheet('Training by category', { views: [{ showGridLines: false }] });
  const columnsToDisplay = isParent ? columnNameAndDataFields : columnNameAndDataFields.slice(1);
  addTitle(trainingByCategoryTab);
  addTopTableHeader(trainingByCategoryTab, columnsToDisplay);

  const sortedData = lodash.sortBy(trainingByCategoryBreakdowns, ['workplaceName', 'category']);

  addTrainingByCategoryTable(trainingByCategoryTab, sortedData, columnsToDisplay);

  // addWorkerTable(trainingByStaffTab, workerTrainingBreakdowns, isParent);

  // setHeightsAndWidths(trainingByStaffTab);

  // addFootNote(trainingByStaffTab);

  // setFreezePane(trainingByStaffTab);
};

const addTitle = (trainingByCategoryTab) => {
  addText(trainingByCategoryTab, 'B1:Z1', 'Training records by category', { size: 24, bold: true });
  trainingByCategoryTab.getCell('B1').alignment = { vertical: 'middle' };
  setColourForRange(trainingByCategoryTab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });
};

const addTopTableHeader = (tab, columnsToDisplay) => {
  const lastColumnLetter = colCache.n2l(1 + columnsToDisplay.length);

  const topHeaderRange = `B3:${lastColumnLetter}3`;
  addText(tab, topHeaderRange, 'Training', { size: 12, bold: true });
  applyStyleToRange(tab, topHeaderRange, tableHeaderCellStyle);
};

const addTrainingByCategoryTable = (tab, sortedData, columnsToDisplay) => {
  const tableRows = sortedData.map((trainingData) => {
    return columnsToDisplay.map(({ field }) => trainingData[field] ?? '-');
  });

  if (tableRows.length === 0) {
    tableRows.push(Array(columnsToDisplay.length).fill(''));
  }

  const trainingTable = tab.addTable({
    name: 'expiredTrainingTable',
    ref: `B${HeaderRowNumber}`,
    columns: columnsToDisplay.map(({ columnName }) => ({ name: columnName, filterButton: true })),
    rows: tableRows,
  });
  const tableRange = trainingTable.model.tableRef;

  trainingTable.commit();

  setBasicTableStyle(tab, tableRange, {
    hasTotalRow: false,
    alignHorizontalCenter: false,
    bold: false,
  });

  // setStyleForMandatoryColumn(tab);
  // setStyleForStatusColumn(tab);
  // setDateFormatForExpiryDateColumn(tab);
};

module.exports = { generateTrainingByCategoryTab };
