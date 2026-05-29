const colCache = require('exceljs/lib/utils/col-cache');
const lodash = require('lodash');

const {
  newBackgroundColours,
  addText,
  setColourForRange,
  applyStyleToRange,
  tableHeaderCellStyle,
  setBasicTableStyle,
  conditionalColoursForTrainingExpiry,
  forEachCellInRange,
  defaultDateFormat,
  autoAdjustWrapTextAndRowHeight,
} = require('../../../utils/excelUtils');

const columnNameAndDataFields = [
  { columnName: 'Workplace', field: 'workplaceName', width: 33 },
  { columnName: 'Training category', field: 'category', width: 33 },
  { columnName: 'Training or course name', field: 'trainingName', width: 33 },
  { columnName: 'Name or ID number', field: 'workerNameOrId', width: 22 },
  { columnName: 'Mandatory', field: 'isMandatory', width: 15 },
  { columnName: 'Status', field: 'status', width: 15 },
  { columnName: 'Expiry date', field: 'expiryDate', width: 15 },
];

const HeaderRowNumber = 4;

const generateExpiredTrainingTab = async (workbook, trainingRecords, isParent = false) => {
  const expiredTrainingTab = workbook.addWorksheet('Expired training', { views: [{ showGridLines: false }] });

  const columnsToDisplay = isParent ? columnNameAndDataFields : columnNameAndDataFields.slice(1);

  addTitle(expiredTrainingTab);

  addTopTableHeader(expiredTrainingTab, columnsToDisplay);

  const trainingDataToShow = trainingRecords.filter((training) =>
    ['Expiring soon', 'Expired', 'Missing'].includes(training.status),
  );
  const sortedData = lodash.sortBy(trainingDataToShow, ['workplaceName', 'category', 'workerNameOrId']);

  addExpiredTrainingsTable(expiredTrainingTab, sortedData, columnsToDisplay);

  setHeightsAndWidths(expiredTrainingTab, columnsToDisplay);

  setFreezePane(expiredTrainingTab);
};

const addTitle = (tab) => {
  addText(tab, 'B1:Z1', 'Expired and missing training', { size: 24, bold: true });
  tab.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };
  setColourForRange(tab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });
};

const addTopTableHeader = (tab, columnsToDisplay) => {
  const lastColumnLetter = colCache.n2l(1 + columnsToDisplay.length);

  const topHeaderRange = `B3:${lastColumnLetter}3`;
  addText(tab, topHeaderRange, 'Training', { size: 12, bold: true });
  applyStyleToRange(tab, topHeaderRange, tableHeaderCellStyle);
};

const addExpiredTrainingsTable = (tab, sortedData, columnsToDisplay) => {
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

  setStyleForMandatoryColumn(tab);
  setStyleForStatusColumn(tab);
  setDateFormatForExpiryDateColumn(tab);
};

const setStyleForMandatoryColumn = (tab) => {
  const mandatoryColumnNumber = tab.getRow(HeaderRowNumber).values.indexOf('Mandatory');
  tab.getColumn(mandatoryColumnNumber).alignment = { horizontal: 'center', vertical: 'middle' };
};

const setStyleForStatusColumn = (tab) => {
  const statusColumnNumber = tab.getRow(HeaderRowNumber).values.indexOf('Status');
  const firstWorkerRow = HeaderRowNumber + 1;
  const lastWorkerRow = tab.lastRow.number;

  const statusColourRange = colCache.encode(firstWorkerRow, statusColumnNumber, lastWorkerRow, statusColumnNumber);
  tab.addConditionalFormatting({
    ref: statusColourRange,
    rules: conditionalColoursForTrainingExpiry,
  });
  tab.getColumn(statusColumnNumber).alignment = { horizontal: 'center', vertical: 'middle' };
};

const setDateFormatForExpiryDateColumn = (tab) => {
  const expiryDateColumnNumber = tab.getRow(HeaderRowNumber).values.indexOf('Expiry date');
  const firstWorkerRow = HeaderRowNumber + 1;
  const lastWorkerRow = tab.lastRow.number;

  const expiryDatesRange = colCache.encode(
    firstWorkerRow,
    expiryDateColumnNumber,
    lastWorkerRow,
    expiryDateColumnNumber,
  );

  forEachCellInRange(tab, expiryDatesRange, (cell) => {
    cell.numFmt = defaultDateFormat;
  });
  tab.getColumn(expiryDateColumnNumber).alignment = { horizontal: 'left', vertical: 'middle' };
};

const setHeightsAndWidths = (tab, columnsToDisplay) => {
  const columnWidths = [8, ...columnsToDisplay.map((column) => column.width)];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  const rowHeights = [45, 18, 22, 36];

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });

  for (let i = 5; i <= tab.lastRow.number; i++) {
    const row = tab.getRow(i);
    row.height = 22;
  }

  autoAdjustWrapTextForColumns(tab);
};

const setFreezePane = (tab) => {
  tab.views = [{ state: 'frozen', ySplit: 4, activeCell: 'B5' }, { showGridLines: false }];
};

const autoAdjustWrapTextForColumns = (tab) => {
  const top = HeaderRowNumber + 1;
  const bottom = tab.lastRow.number;

  const autoAdjustRange = `B${top}:E${bottom}`;

  forEachCellInRange(tab, autoAdjustRange, (cell) => {
    const columnWidth = tab.getColumn(cell.col).width;
    autoAdjustWrapTextAndRowHeight(tab, cell, columnWidth);
  });
};

module.exports = { generateExpiredTrainingTab };
