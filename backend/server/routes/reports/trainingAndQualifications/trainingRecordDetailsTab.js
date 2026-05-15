const colCache = require('exceljs/lib/utils/col-cache');
const lodash = require('lodash');

const {
  addText,
  setColourForRange,
  newBackgroundColours,
  setBasicTableStyle,
  forEachCellInRange,
  defaultDateFormat,
  applyStyleToRange,
  conditionalColoursForTrainingExpiry,
  autoAdjustWrapTextAndRowHeight,
} = require('../../../utils/excelUtils');

const columnNamesAndDataFields = [
  { columnName: 'Workplace', field: 'workplaceName', width: 30 },
  { columnName: 'Name or ID number', field: 'workerNameOrId', width: 30 },
  { columnName: 'Main job role', field: 'mainJobRole', width: 30 },
  { columnName: 'Training category', field: 'category', width: 30 },
  { columnName: 'Training or course name', field: 'trainingName', width: 30 },
  { columnName: 'Mandatory', field: 'isMandatory', width: 12 },
  { columnName: 'Validity period', field: 'validityPeriodInMonth', width: 18 },
  { columnName: 'Completion date', field: 'dateCompleted', width: 18 },
  { columnName: 'Expiry date', field: 'expiryDate', width: 18 },
  { columnName: 'Status', field: 'status', width: 18 },
  { columnName: 'Accredited', field: 'accredited', width: 18 },
  { columnName: 'In-house or external', field: 'deliveredBy', width: 22 },
  { columnName: 'Provider name', field: 'trainingProviderName', width: 30 },
  { columnName: 'Delivery method', field: 'howWasItDelivered', width: 19 },
  { columnName: 'Certificate upload', field: 'trainingCertificateUploaded', width: 19 },
  { columnName: 'Long term absence', field: 'isInLongTermAbsence', width: 19 },
];

const HeaderRowNumber = 3;

const generateTrainingRecordDetailsTab = async (workbook, trainingData, isParent = false) => {
  const trainingTab = workbook.addWorksheet('Training record details', { views: [{ showGridLines: false }] });
  const columnsToDisplay = isParent ? columnNamesAndDataFields : columnNamesAndDataFields.slice(1);

  const sortedTrainingData = lodash.sortBy(trainingData, ['workplaceName', 'workerNameOrId', 'category']);

  addTitle(trainingTab);

  addTrainingRecordsTable(trainingTab, sortedTrainingData, columnsToDisplay);

  setHeightsAndWidths(trainingTab, columnsToDisplay);

  setFreezePane(trainingTab);
};

const addTitle = (tab) => {
  addText(tab, 'B1:Z1', 'Training record details', { size: 24, bold: true });
  tab.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };
  setColourForRange(tab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });
};

const addTrainingRecordsTable = (tab, trainingData, columnsToDisplay) => {
  const tableRows = trainingData.map((training) => {
    return columnsToDisplay.map(({ field }) => training[field] ?? '-');
  });

  const trainingTable = tab.addTable({
    name: 'trainingRecordDetailsTable',
    ref: `B${HeaderRowNumber}`,
    columns: columnsToDisplay.map(({ columnName }) => ({
      name: columnName,
      filterButton: true,
    })),
    rows: tableRows,
  });
  const tableRange = trainingTable.model.tableRef;

  trainingTable.commit();

  setBasicTableStyle(tab, tableRange, {
    hasTotalRow: false,
    alignHorizontalCenter: false,
    bold: false,
  });

  setStyleForStatusColumn(tab);
  setDateAndNumberFormats(tab);
};

const setStyleForStatusColumn = (tab) => {
  const headerRow = tab.getRow(HeaderRowNumber);
  const lastRowNumber = tab.lastRow.number;

  const statusColumnNumber = headerRow.values.indexOf('Status');

  const statusColourRange = colCache.encode(HeaderRowNumber + 1, statusColumnNumber, lastRowNumber, statusColumnNumber);
  tab.addConditionalFormatting({
    ref: statusColourRange,
    rules: conditionalColoursForTrainingExpiry,
  });
  tab.getColumn(statusColumnNumber).alignment = { horizontal: 'center', vertical: 'middle' };
};

const setDateAndNumberFormats = (tab) => {
  const headerRow = tab.getRow(HeaderRowNumber);
  const lastRowNumber = tab.lastRow.number;

  const getRangeByColumnName = (columnName) => {
    const columnNumber = headerRow.values.indexOf(columnName);
    const columnRange = colCache.encode(HeaderRowNumber + 1, columnNumber, lastRowNumber, columnNumber);
    return columnRange;
  };

  const validityRange = getRangeByColumnName('Validity period');
  const completionDateRange = getRangeByColumnName('Completion date');
  const expiryDateRange = getRangeByColumnName('Expiry date');

  forEachCellInRange(tab, validityRange, (cell) => {
    cell.numFmt = '[>1]# "months";[=1]# "month";General';
  });

  forEachCellInRange(tab, completionDateRange, (cell) => {
    cell.numFmt = defaultDateFormat;
  });

  forEachCellInRange(tab, expiryDateRange, (cell) => {
    cell.numFmt = defaultDateFormat;
  });

  [validityRange, completionDateRange, expiryDateRange].forEach((range) =>
    applyStyleToRange(tab, range, { alignment: { horizontal: 'left', vertical: 'middle' } }),
  );
};

const setHeightsAndWidths = (tab, columnsToDisplay) => {
  const columnWidths = [9, ...columnsToDisplay.map((column) => column.width)];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  const rowHeights = [48, 18, 36];

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });

  for (let i = HeaderRowNumber + 1; i <= tab.lastRow.number; i++) {
    const row = tab.getRow(i);
    row.height = 22;
  }

  const trainingNameColumnNumber = tab.getRow(HeaderRowNumber).values.indexOf('Training or course name');
  const autoAdjustRange = colCache.encode(HeaderRowNumber + 1, 2, tab.lastRow.number, trainingNameColumnNumber);

  forEachCellInRange(tab, autoAdjustRange, (cell) => {
    const columnWidth = tab.getColumn(cell.col).width;
    autoAdjustWrapTextAndRowHeight(tab, cell, columnWidth);
  });
};

const setFreezePane = (tab) => {
  tab.views = [{ state: 'frozen', ySplit: 3, activeCell: 'B4' }, { showGridLines: false }];
};

module.exports = { generateTrainingRecordDetailsTab };
