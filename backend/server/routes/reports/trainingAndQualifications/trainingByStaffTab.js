const {
  addText,
  setColourForRange,
  newBackgroundColours,
  newTextColours,
  setColourForCell,
  setBasicTableStyle,
  tableHeaderCellStyle,
  borderStyles,
  applyStyleToRange,
  forEachCellInRange,
  colourSchemeForTrainingExpiry,
  autoAdjustWrapTextAndRowHeight,
} = require('../../../utils/excelUtils');

const colCache = require('exceljs/lib/utils/col-cache');
const lodash = require('lodash');

const GroupHeaderRowNumber = 3;
const HeaderRowNumber = 4;

const columnNamesAndDataFields = [
  { columnName: 'Workplace', field: 'workplaceName', width: 30 },
  { columnName: 'Name or ID number', field: 'name', width: 30 },
  { columnName: 'Total', field: 'trainingCount', width: 14 },
  { columnName: 'Expired', field: 'expiredMandatoryTrainingCount', isMandatoryTrainingField: true, width: 14 },
  {
    columnName: 'Expiring soon',
    field: 'expiringMandatoryTrainingCount',
    isMandatoryTrainingField: true,
    width: 14,
  },
  { columnName: 'Up-to-date', field: 'upToDateMandatoryTrainingCount', isMandatoryTrainingField: true, width: 14 },
  // Note: white space are added around the text, as Excel raise error on duplicated column names in table
  { columnName: ' Total ', field: 'mandatoryTrainingCount', isMandatoryTrainingField: true, width: 14 },
  { columnName: 'Missing', field: 'missingMandatoryTrainingCount', isMandatoryTrainingField: true, width: 14 },
  { columnName: ' Expired ', field: 'expiredNonMandatoryTrainingCount', width: 14 },
  {
    columnName: ' Expiring soon ',
    field: 'expiringNonMandatoryTrainingCount',
    width: 14,
  },
  {
    columnName: ' Up-to-date ',
    field: 'upToDateNonMandatoryTrainingCount',
  },
  { columnName: '  Total  ', field: 'nonMandatoryTrainingCount', width: 14 },
];

const generateTrainingByStaffTab = async (workbook, workerTrainingBreakdowns, isParent = false) => {
  const trainingByStaffTab = workbook.addWorksheet('Training by staff', { views: [{ showGridLines: false }] });
  const columnsToDisplay = isParent ? columnNamesAndDataFields : columnNamesAndDataFields.slice(1);

  addTitle(trainingByStaffTab);

  addGroupHeaderRow(trainingByStaffTab, isParent);

  addWorkerTable(trainingByStaffTab, workerTrainingBreakdowns, columnsToDisplay);

  setHeightsAndWidths(trainingByStaffTab, columnsToDisplay);

  addFootNote(trainingByStaffTab);

  setFreezePane(trainingByStaffTab);
};

const addTitle = (trainingByStaffTab) => {
  addText(trainingByStaffTab, 'B1:Z1', 'Training records by staff', { size: 24, bold: true });
  trainingByStaffTab.getCell('B1').alignment = { vertical: 'middle' };
  setColourForRange(trainingByStaffTab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });
};

const addGroupHeaderRow = (tab, isParent) => {
  const rangeForEachGroup = isParent ? ['B3:D3', 'E3:I3', 'J3:M3'] : ['B3:C3', 'D3:H3', 'I3:L3'];

  addText(tab, rangeForEachGroup[0], 'Records added', { bold: true });
  addText(tab, rangeForEachGroup[1], 'Mandatory training', { bold: true });
  addText(tab, rangeForEachGroup[2], 'Non-mandatory training', { bold: true });

  const lastColumnLetter = isParent ? 'M' : 'L';
  applyStyleToRange(tab, `B3:${lastColumnLetter}3`, tableHeaderCellStyle);
};

const addWorkerTable = (tab, workerTrainingBreakdowns, columnsToDisplay) => {
  const workerTableData = workerTrainingBreakdowns.map((worker) => {
    const maskMandatoryTrainingCount = worker.workplaceHasMandatoryTraining === false;

    const rowData = columnsToDisplay.map(({ field, isMandatoryTrainingField }) => {
      if (maskMandatoryTrainingCount && isMandatoryTrainingField) {
        return '-';
      }
      return worker[field];
    });
    return rowData;
  });

  const tableColumnNames = columnsToDisplay.map(({ columnName }) => columnName);
  const headerRow = tab.getRow(HeaderRowNumber);
  headerRow.values = ['', ...tableColumnNames];

  const trainingTable = tab.addTable({
    name: 'trainingByStaffTable',
    ref: `B${HeaderRowNumber}`,
    columns: columnsToDisplay.map(({ columnName }) => ({ name: columnName, filterButton: true })),
    rows: workerTableData,
  });

  trainingTable.commit();

  const totalNumbers = calculateTotals(workerTrainingBreakdowns);

  addTotalRow(tab, totalNumbers, columnsToDisplay);

  const [top, left, bottom, right] = [HeaderRowNumber, 2, tab.lastRow.number, columnsToDisplay.length + 1];

  const tableRange = colCache.encode(top, left, bottom, right);
  setStyleForWorkerTable(tab, tableRange);
};

const calculateTotals = (workerTrainingBreakdowns) => {
  if (!workerTrainingBreakdowns?.length) {
    return {};
  }

  const fieldNames = Object.keys(workerTrainingBreakdowns[0]);
  const numericFields = fieldNames.filter((field) => field.endsWith('Count'));
  const result = {};

  numericFields.forEach((field) => {
    const countsForAllWorkersOfThisField = lodash.map(workerTrainingBreakdowns, field);
    const total = lodash.sum(countsForAllWorkersOfThisField);
    result[field] = total;
  });

  return result;
};

const addTotalRow = (tab, totals, columnsToDisplay) => {
  const totalRowData = columnsToDisplay.map(({ columnName, field }) => {
    if (columnName === 'Name or ID number') {
      return 'Total';
    }
    if (field.endsWith('Count')) {
      return totals[field];
    }
    return '';
  });

  tab.addRow(['', ...totalRowData]);
};

const setStyleForWorkerTable = (tab, tableRange) => {
  setBasicTableStyle(tab, tableRange, { bold: true, hasTotalRow: true, alignHorizontalCenter: true });

  const headerRow = tab.getRow(HeaderRowNumber);

  const headerCellWorkerName = tab.getCell(HeaderRowNumber, headerRow.values.indexOf('Name or ID number'));
  setColourForCell(headerCellWorkerName, { backgroundColour: newBackgroundColours.lightGrey });

  const headerCellWhiteTextOnBlack = tab.getCell(HeaderRowNumber, headerRow.values.indexOf('Total'));
  setColourForCell(headerCellWhiteTextOnBlack, {
    backgroundColour: newBackgroundColours.black,
    textColour: newTextColours.white,
  });

  const lastColumnInTable = colCache.decode(tableRange).right;
  const expiredColumnNumber = headerRow.values.indexOf('Expired');
  const headerCellsWithColourCode = colCache.encode(
    HeaderRowNumber,
    expiredColumnNumber,
    HeaderRowNumber,
    lastColumnInTable,
  );

  forEachCellInRange(tab, headerCellsWithColourCode, (cell) => {
    const textInCell = cell.value;
    const backgroundColourForCell = colourSchemeForTrainingExpiry.find(({ text }) => textInCell.includes(text))?.colour;
    if (backgroundColourForCell) {
      setColourForCell(cell, { backgroundColour: backgroundColourForCell });
    }
  });

  const lastRowNumber = colCache.decode(tableRange).bottom;

  setStyleForWorkerNamesColumn(tab, lastRowNumber);

  addThickBorders(tab, lastRowNumber);
};

const addThickBorders = (tab, lastRowNumber) => {
  ['Mandatory training', 'Non-mandatory training'].forEach((groupName) => {
    const columnNumber = tab.getRow(GroupHeaderRowNumber).values.indexOf(groupName);
    const tableRangeForColumn = colCache.encode(GroupHeaderRowNumber, columnNumber, lastRowNumber, columnNumber);

    applyStyleToRange(tab, tableRangeForColumn, { border: borderStyles.thickBlackBorderLeft });
  });
};

const setStyleForWorkerNamesColumn = (tab, lastRowNumber) => {
  const headerRow = tab.getRow(HeaderRowNumber);

  const workerColumnNum = headerRow.values.indexOf('Name or ID number');
  const workerColumnRange = colCache.encode(HeaderRowNumber, workerColumnNum, lastRowNumber, workerColumnNum);

  applyStyleToRange(tab, workerColumnRange, { alignment: { horizontal: 'left' }, font: { bold: false } });

  tab.getCell(HeaderRowNumber, workerColumnNum).font.bold = true;
  tab.getCell(lastRowNumber, workerColumnNum).font.bold = true;
};

const addFootNote = (tab) => {
  const footNoteText = [
    'The figures shown could include records of staff who have been flagged as long-term absent.',
    'Note, the number in the Missing column may include training not yet taken by new starters.',
  ];

  tab.addRow([]);

  footNoteText.forEach((text) => {
    const newRow = tab.lastRow.number + 1;
    addText(tab, `B${newRow}`, text);
  });
};

const setHeightsAndWidths = (tab, columnsToDisplay) => {
  const columnWidths = [8, ...columnsToDisplay.map((column) => column.width)];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  const rowHeights = [45, 19, 22, 38];

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
  tab.views = [{ state: 'frozen', ySplit: HeaderRowNumber, activeCell: 'B1' }, { showGridLines: false }];
};

const autoAdjustWrapTextForColumns = (tab) => {
  const top = HeaderRowNumber + 1;
  const bottom = tab.lastRow.number;

  const autoAdjustRange = `B${top}:C${bottom}`;

  forEachCellInRange(tab, autoAdjustRange, (cell) => {
    const columnWidth = tab.getColumn(cell.col).width;
    autoAdjustWrapTextAndRowHeight(tab, cell, columnWidth);
  });
};

module.exports = { generateTrainingByStaffTab };
