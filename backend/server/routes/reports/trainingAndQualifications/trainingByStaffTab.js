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
  forEachCellInRange,
  autoFitColumnWidthByTextLength,
} = require('../../../utils/excelUtils');
const colCache = require('exceljs/lib/utils/col-cache');

const GroupHeaderRowNumber = 3;
const HeaderRowNumber = 4;

const generateTrainingByStaffTab = async (workbook, workerTrainingBreakdowns) => {
  const trainingByStaffTab = workbook.addWorksheet('Training by staff', { views: [{ showGridLines: false }] });

  addText(trainingByStaffTab, 'B1:Z1', 'Training records by staff', { size: 24, bold: true });
  trainingByStaffTab.getCell('B1').alignment = { vertical: 'middle' };
  setColourForRange(trainingByStaffTab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });

  addText(trainingByStaffTab, 'B3:C3', 'Records added', { bold: true });
  addText(trainingByStaffTab, 'D3:H3', 'Mandatory training', { bold: true });
  addText(trainingByStaffTab, 'I3:L3', 'Non-mandatory training', { bold: true });

  applyStyleToRange(trainingByStaffTab, 'B3:L3', tableHeaderCellStyle);

  const tableRange = addTrainingByStaffWorkerTable(trainingByStaffTab, workerTrainingBreakdowns);

  addFootNote(trainingByStaffTab);

  setHeightsAndWidths(trainingByStaffTab, tableRange);

  setFreezePane(trainingByStaffTab, tableRange);
};

const addTrainingByStaffWorkerTable = (tab, workerTrainingBreakdowns) => {
  const tableColumnNames = [
    'Name or ID number',
    'Total',
    'Expired',
    'Expiring soon',
    'Up-to-date',
    'Total',
    'Missing',
    'Expired',
    'Expiring soon',
    'Up-to-date',
    'Total',
  ];

  const workerTable = tab.addTable({
    name: 'trainingByStaffTable',
    ref: 'B4',
    columns: tableColumnNames.map((name) => ({ name, filterButton: true })),
    rows: [],
    totalsRow: true,
    showFirstColumn: true,
  });

  const workerTableData = workerTrainingBreakdowns.map((worker) => {
    const hideMandatoryTrainingCount = worker.workplaceHasMandatoryTraining === false;

    return [
      worker.name,
      worker.trainingCount,
      hideMandatoryTrainingCount ? '-' : worker.expiredMandatoryTrainingCount,
      hideMandatoryTrainingCount ? '-' : worker.expiringMandatoryTrainingCount,
      hideMandatoryTrainingCount ? '-' : worker.upToDateMandatoryTrainingCount,
      hideMandatoryTrainingCount ? '-' : worker.mandatoryTrainingCount,
      hideMandatoryTrainingCount ? '-' : worker.missingMandatoryTrainingCount,
      worker.expiredNonMandatoryTrainingCount,
      worker.expiringNonMandatoryTrainingCount,
      worker.upToDateNonMandatoryTrainingCount,
      worker.nonMandatoryTrainingCount,
    ];
  });

  workerTableData.forEach((rowData) => {
    workerTable.addRow(rowData);
  });

  workerTable.commit();

  const tableRange = workerTable.model.tableRef;

  // delete the table object and fill in column names manually,
  // as Excel table does not allow duplicated header column names
  tab.removeTable('trainingByStaffTable');
  const headerRow = tab.getRow(HeaderRowNumber);
  headerRow.values = ['', ...tableColumnNames];

  addFormulaToTotalRow(tab, tableRange);

  setStyleForWorkerTable(tab, tableRange);

  return tableRange;
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

  tab.addConditionalFormatting({
    ref: headerCellsWithColourCode,
    rules: [
      ...conditionalColoursForTrainingExpiry,
      {
        type: 'cellIs',
        operator: 'equal',
        formulae: ['"Total"'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: newBackgroundColours.lightGrey },
          font: { bold: true, size: 12, family: 4, color: newTextColours.black },
        },
      },
    ],
  });

  const lastRowNumber = colCache.decode(tableRange).bottom;

  setStyleForWorkerNamesColumn(tab, lastRowNumber);

  addThickBorders(tab, lastRowNumber);
};

const addFootNote = (tab) => {
  const lastRow = tab.lastRow.number;
  addText(
    tab,
    `B${lastRow + 1}:L${lastRow + 1}`,
    'The figures shown could include records of staff who have been flagged as long-term absent.',
  );

  addText(
    tab,
    `B${lastRow + 2}:L${lastRow + 2}`,
    'Note, the number in the Missing column may include training not yet taken by new starters.',
  );
};

const setHeightsAndWidths = (tab) => {
  const columnWidths = [6.8, 26.8, Array(10).fill(14)].flat();

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  const workerNameColumn = 'B';
  const fontsize = 12;
  autoFitColumnWidthByTextLength(tab, workerNameColumn, fontsize);

  const rowHeights = [47, 19, 22, 38];

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });

  for (let i = 5; i <= tab.lastRow.number; i++) {
    const row = tab.getRow(i);
    row.height = 22;
  }
};

const setFreezePane = (tab) => {
  tab.views = [{ state: 'frozen', ySplit: 4, activeCell: 'B1' }, { showGridLines: false }];
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

const addFormulaToTotalRow = (tab, tableRange) => {
  const { left, bottom, right } = colCache.decode(tableRange);
  const rangeToAddTotalNumbers = colCache.encode(bottom, left + 1, bottom, right);

  forEachCellInRange(tab, rangeToAddTotalNumbers, (cell) => {
    const columnLetter = colCache.n2l(cell.col);
    const firstWorkerCell = `${columnLetter}${HeaderRowNumber + 1}`;
    const lastWorkerCell = `${columnLetter}${bottom - 1}`;

    cell.value = { formula: `SUM(${firstWorkerCell}:${lastWorkerCell})` };
  });
};

module.exports = { generateTrainingByStaffTab };
