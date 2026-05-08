const colCache = require('exceljs/lib/utils/col-cache');
const {
  addText,
  setColourForRange,
  newBackgroundColours,
  setBasicTableStyle,
  forEachCellInRange,
  defaultDateFormat,
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
    ref: 'B4',
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

  // setStyleForStatusColumn(tab);
  setDateAndNumberFormats(tab);
};

const setDateAndNumberFormats = (tab) => {
  const headerRow = tab.getRow(4);
  const lastRowNumber = tab.lastRow.number;

  const getRangeByColumnName = (columnName) => {
    const columnNumber = headerRow.values.indexOf(columnName);
    const columnRange = colCache.encode(4 + 1, columnNumber, lastRowNumber, columnNumber);
    return columnRange;
  };

  const validityRange = getRangeByColumnName('Validity period');
  const completionDateRange = getRangeByColumnName('Completion date');
  const expiryDateRange = getRangeByColumnName('Expiry date');

  console.log(validityRange, '<--- this');
  forEachCellInRange(tab, validityRange, (cell) => {
    cell.numFmt = '[>1]# "months";[=1]# "month";General';
  });

  forEachCellInRange(tab, completionDateRange, (cell) => {
    cell.numFmt = defaultDateFormat;
  });

  forEachCellInRange(tab, expiryDateRange, (cell) => {
    cell.numFmt = defaultDateFormat;
  });
};

module.exports = { generateTrainingRecordDetailsTab };
