const colCache = require('exceljs/lib/utils/col-cache');
const lodash = require('lodash');

const {
  addText,
  setColourForRange,
  newBackgroundColours,
  setBasicTableStyle,
  forEachCellInRange,
  autoAdjustWrapTextAndRowHeight,
} = require('../../../utils/excelUtils');
const models = require('../../../models');
const { convertAndFlattenQualificationsForEstablishments } = require('../../../utils/trainingAndQualificationsUtils');

const columnNamesAndDataFields = [
  { columnName: 'Workplace', field: 'workplaceName', width: 30 },
  { columnName: 'Name or ID number', field: 'workerName', width: 30 },
  { columnName: 'Main job role', field: 'jobRole', width: 30 },
  { columnName: 'Qualification type', field: 'qualificationType', width: 30 },
  { columnName: 'Qualification name', field: 'qualificationName', width: 35 },
  { columnName: 'Level', field: 'qualificationLevel', width: 15 },
  { columnName: 'Year achieved', field: 'yearAchieved', width: 18 },
  { columnName: 'Certificate upload', field: 'certificateUploaded', width: 18 },
];

const HeaderRowNumber = 3;

const generateQualificationRecordDetailsTab = async (workbook, establishmentId, isParent = false) => {
  const qualificationTab = workbook.addWorksheet('Qualification record details', { views: [{ showGridLines: false }] });
  const columnsToDisplay = isParent ? columnNamesAndDataFields : columnNamesAndDataFields.slice(1);

  const rawEstablishments = await models.establishment.getWorkerQualifications(establishmentId, isParent);
  const qualificationData = convertAndFlattenQualificationsForEstablishments(rawEstablishments);

  const sortedData = lodash.sortBy(qualificationData, ['workplaceName', 'workerName', 'qualificationName']);

  addTitle(qualificationTab);

  addQualificationRecordsTable(qualificationTab, sortedData, columnsToDisplay);

  setHeightsAndWidths(qualificationTab, columnsToDisplay);

  setFreezePane(qualificationTab);
};

const addTitle = (tab) => {
  addText(tab, 'B1:Z1', 'Qualification record details', { size: 24, bold: true });
  tab.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };
  setColourForRange(tab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });
};

const addQualificationRecordsTable = (tab, trainingData, columnsToDisplay) => {
  const tableRows = trainingData.map((training) => {
    return columnsToDisplay.map(({ field }) => training[field] ?? '-');
  });
  if (tableRows.length === 0) {
    tableRows.push(Array(columnsToDisplay.length).fill(''));
  }

  const qualificationTable = tab.addTable({
    name: 'qualificationRecordDetailsTable',
    ref: `B${HeaderRowNumber}`,
    columns: columnsToDisplay.map(({ columnName }) => ({
      name: columnName,
      filterButton: true,
    })),
    rows: tableRows,
  });
  const tableRange = qualificationTable.model.tableRef;

  qualificationTable.commit();

  setBasicTableStyle(tab, tableRange, {
    hasTotalRow: false,
    alignHorizontalCenter: false,
    bold: false,
  });

  setFormatForLevelColumn(tab);
};

const setFormatForLevelColumn = (tab) => {
  const headerRow = tab.getRow(HeaderRowNumber);
  const lastRowNumber = tab.lastRow.number;

  const levelColumnNumber = headerRow.values.indexOf('Level');
  const range = colCache.encode(HeaderRowNumber + 1, levelColumnNumber, lastRowNumber, levelColumnNumber);

  forEachCellInRange(tab, range, (cell) => {
    if (typeof cell.value === 'number' || cell.value === 'E') {
      cell.value = `Level ${cell.value}`;
    }
  });
};

const setHeightsAndWidths = (tab, columnsToDisplay) => {
  const columnWidths = [8, ...columnsToDisplay.map((column) => column.width)];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  const rowHeights = [45, 18, 36];

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });

  const qualificationNameColumnNumber = tab.getRow(HeaderRowNumber).values.indexOf('Qualification name');
  const autoAdjustRange = colCache.encode(HeaderRowNumber + 1, 2, tab.lastRow.number, qualificationNameColumnNumber);

  forEachCellInRange(tab, autoAdjustRange, (cell) => {
    autoAdjustWrapTextAndRowHeight(tab, cell);
  });
};

const setFreezePane = (tab) => {
  tab.views = [{ state: 'frozen', ySplit: 3, activeCell: 'B4' }, { showGridLines: false }];
};

module.exports = { generateQualificationRecordDetailsTab };
