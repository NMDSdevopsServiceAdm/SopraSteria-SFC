const colCache = require('exceljs/lib/utils/col-cache');
const {
  addText,
  setColourForRange,
  newBackgroundColours,
  setBasicTableStyle,
  forEachCellInRange,
  defaultDateFormat,
  applyStyleToRange,
  conditionalColoursForTrainingExpiry,
  autoFitColumnWidthByTextLength,
  applyStyleToCell,
} = require('../../../utils/excelUtils');

const columnNamesAndDataFields = [
  { columnName: 'Workplace', field: 'workplaceName' },
  { columnName: 'Name or ID number', field: 'workerNameOrId' },
  { columnName: 'Main job role', field: 'mainJobRole' },
  { columnName: 'Training category', field: 'category' },
  { columnName: 'Training or course name', field: 'trainingName' },
  { columnName: 'Mandatory', field: 'isMandatory' },
  { columnName: 'Validity period', field: 'validityPeriodInMonth' },
  { columnName: 'Completion date', field: 'dateCompleted' },
  { columnName: 'Expiry date', field: 'expiryDate' },
  { columnName: 'Status', field: 'status' },
  { columnName: 'Accredited', field: 'accredited' },
  { columnName: 'In-house or external', field: 'deliveredBy' },
  { columnName: 'Provider name', field: 'trainingProviderName' },
  { columnName: 'Delivery method', field: 'howWasItDelivered' },
  { columnName: 'Certificate upload', field: 'trainingCertificateUploaded' },
  { columnName: 'Long term absence', field: 'isInlongTermAbsence' },
];

const generateTrainingRecordDetailsTab = async (workbook, trainingData, isParent = false) => {
  const trainingTab = workbook.addWorksheet('Training record details', { views: [{ showGridLines: false }] });
  const columnsToDisplay = isParent ? columnNamesAndDataFields : columnNamesAndDataFields.slice(1);

  addTitle(trainingTab);

  addTrainingRecordsTable(trainingTab, trainingData, columnsToDisplay);

  setHeightsAndWidths(trainingTab);

  // setFreezePane(trainingTab);
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
    ref: 'B3',
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
  const headerRow = tab.getRow(3);
  const lastRowNumber = tab.lastRow.number;

  const statusColumnNumber = headerRow.values.indexOf('Status');

  const statusColourRange = colCache.encode(3 + 1, statusColumnNumber, lastRowNumber, statusColumnNumber);
  tab.addConditionalFormatting({
    ref: statusColourRange,
    rules: conditionalColoursForTrainingExpiry,
  });
  tab.getColumn(statusColumnNumber).alignment = { horizontal: 'center', vertical: 'middle' };
};

const setDateAndNumberFormats = (tab) => {
  const headerRow = tab.getRow(3);
  const lastRowNumber = tab.lastRow.number;

  const getRangeByColumnName = (columnName) => {
    const columnNumber = headerRow.values.indexOf(columnName);
    const columnRange = colCache.encode(3 + 1, columnNumber, lastRowNumber, columnNumber);
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

const setHeightsAndWidths = (tab) => {
  const columnWidths = [9, Array(4).fill(30), 12, Array(5).fill(18), 22, 30, Array(3).fill(19)].flat();

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  const rowHeights = [48, 18, 36];

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });

  for (let i = 4; i <= tab.lastRow.number; i++) {
    const row = tab.getRow(i);
    row.height = 22;
  }

  const setTextWrap = (tab, cell, defaultWidth = 34, defaultHeight = 22) => {
    const textInCell = cell.value?.length ?? 0;
    const numberOfLinesNeeded = Math.ceil(textInCell / defaultWidth);
    if (numberOfLinesNeeded <= 1) {
      return;
    }

    applyStyleToCell(cell, { alignment: { wrapText: true } });

    const row = tab.getRow(cell.row);
    const adjustedHeight = defaultHeight * numberOfLinesNeeded - 10;
    row.height = Math.max(row.height ?? 0, adjustedHeight);
  };

  forEachCellInRange(tab, 'C4:E61', (cell) => {
    setTextWrap(tab, cell);
  });
};

module.exports = { generateTrainingRecordDetailsTab };
