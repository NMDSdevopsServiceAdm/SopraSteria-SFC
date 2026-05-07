const { convertTrainingForEstablishments } = require('../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  backgroundColours,
  textColours,
  setTableHeadingsStyle,
  addBordersToAllFilledCells,
  setCellTextAndBackgroundColour,
  fitColumnsToSize,
  alignColumnToLeft,
  addBlankRowIfTableEmpty,
  addText,
  setColourForRange,
  newBackgroundColours,
  setBasicTableStyle,
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
  { columnName: 'Long term absence', field: 'longTermAbsence' },
];

const generateTrainingRecordDetailsTab = async (workbook, trainingData, isParent = false) => {
  const trainingTab = workbook.addWorksheet('Training record details', { views: [{ showGridLines: false }] });
  const columnsToDisplay = isParent ? columnNamesAndDataFields : columnNamesAndDataFields.slice(1);

  addTitle(trainingTab);

  console.log(JSON.stringify(trainingData[0]), '<--- trainingData');

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

  // setStyleForMandatoryColumn(tab);
  // setStyleForStatusColumn(tab);
  // setDateFormatForExpiryDateColumn(tab);
};

module.exports = { generateTrainingRecordDetailsTab };
