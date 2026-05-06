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
} = require('../../../utils/excelUtils');

const orderOfColumnNameAndDataFields = [
  { columnName: 'Workplace', field: 'workplaceName' },
  { columnName: 'Training category', field: 'category' },
  { columnName: 'Training or course name', field: 'trainingName' },
  { columnName: 'Name or ID number', field: 'workerNameOrId' },
  { columnName: 'Mandatory', field: 'isMandatory' },
  { columnName: 'Status', field: 'status' },
  { columnName: 'Expiry date', field: 'expiryDate' },
];

const generateExpiredTrainingTab = async (workbook, establishmentsTrainingRecords, isParent = false) => {
  const expiredTrainingTab = workbook.addWorksheet('Expired training', { views: [{ showGridLines: false }] });

  const columnsToDisplay = isParent ? orderOfColumnNameAndDataFields : orderOfColumnNameAndDataFields.slice(1);

  addTitle(expiredTrainingTab);

  addTableHeaders(expiredTrainingTab, columnsToDisplay);

  const trainingDataToShow = establishmentsTrainingRecords.flatMap((establishment) => {
    return establishment.workerRecords.flatMap((worker) => {
      const expiredOrExpiringTrainings = worker.trainingRecords.filter((training) =>
        ['Expiring soon', 'Expired'].includes(training.status),
      );
      const missingMandatoryTrainings = worker.missingMandatoryTrainings;
      const expireOrMissing = [...expiredOrExpiringTrainings, ...missingMandatoryTrainings];

      return expireOrMissing.map((training) => {
        return {
          workplaceName: establishment.name,
          category: training.category,
          trainingName: training.trainingName,
          workerNameOrId: worker.workerId,
          isMandatory: training.isMandatory,
          status: training.status,
          expiryDate: training.expiryDate,
        };
      });
    });
  });

  const sortedData = lodash.sortBy(trainingDataToShow, ['workplaceName', 'category', 'workerNameOrId']);

  addExpiredTrainingsTable(expiredTrainingTab, sortedData, columnsToDisplay);

  setHeightsAndWidths(expiredTrainingTab);
};

const addTitle = (tab) => {
  addText(tab, 'B1:Z1', 'Expired and missing training', { size: 24, bold: true });
  tab.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };
  setColourForRange(tab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });
};

const addTableHeaders = (tab, columnsToShow) => {
  const lastColumnLetter = colCache.n2l(1 + columnsToShow.length);

  const topHeaderRange = `B3:${lastColumnLetter}3`;
  addText(tab, topHeaderRange, 'Training', { size: 12, bold: true });
  applyStyleToRange(tab, topHeaderRange, tableHeaderCellStyle);
};

const addExpiredTrainingsTable = (tab, sortedData, columnsToDisplay) => {
  const tableRows = sortedData.map((trainingData) => {
    return columnsToDisplay.map(({ field }) => trainingData[field] ?? '-');
  });

  const trainingTable = tab.addTable({
    name: 'expiredTrainingTable',
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

  setConditionalColourForStatusColumn(tab, tableRange);
  // setDateFormatForExpiryDateColumn()
};

const setConditionalColourForStatusColumn = (tab) => {
  const statusColumnNumber = tab.getRow(4).values.indexOf('Status');
  const firstWorkerRow = 5;
  const lastWorkerRow = tab.lastRow.number;

  const colourRange = colCache.encode(firstWorkerRow, statusColumnNumber, lastWorkerRow, statusColumnNumber);
  tab.addConditionalFormatting({
    ref: colourRange,
    rules: conditionalColoursForTrainingExpiry,
  });
};

const setHeightsAndWidths = (tab) => {
  const columnWidths = [7, 33, 33, 22, 15, 15, 15];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  const rowHeights = [48, 12, 18, 36];

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });
};

module.exports = { generateExpiredTrainingTab };
