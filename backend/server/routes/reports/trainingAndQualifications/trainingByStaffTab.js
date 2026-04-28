const { convertEachWorkerTrainingBreakdown } = require('../../../utils/trainingAndQualificationsUtils');
const {
  addText,
  setColourForRange,
  newBackgroundColours,
  newTextColours,
  conditionalColoursForTrainingExpiry,
  forEachCellInRange,
  borderStyles,
  setColourForCell,
  setBasicTableStyle,
  tableHeaderCellStyle,
} = require('../../../utils/excelUtils');
const models = require('../../../models');
const lodash = require('lodash');
const colCache = require('exceljs/lib/utils/col-cache');

const generateTrainingByStaffTab = async (workbook, establishmentId) => {
  const trainingByStaffTab = workbook.addWorksheet('Training by staff', { views: [{ showGridLines: false }] });

  const rawEstablishmentTrainingBreakdowns = await models.establishment.workersAndTraining(establishmentId, true);
  const workerTrainingBreakdowns = rawEstablishmentTrainingBreakdowns.rows.flatMap((establishment) => {
    const workerBreakdowns = establishment.workers.map(convertEachWorkerTrainingBreakdown);
    return workerBreakdowns.map((workerBreakDown) => ({
      ...workerBreakDown,
      establishmentName: establishment.NameValue,
    }));
  });

  addText(trainingByStaffTab, 'B1:Z1', 'Training records by staff', { size: 24, bold: true });
  setColourForRange(trainingByStaffTab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });

  addText(trainingByStaffTab, 'B3:C3', 'Records added', { bold: true });
  addText(trainingByStaffTab, 'D3:H3', 'Mandatory training', { bold: true });
  addText(trainingByStaffTab, 'I3:L3', 'Non-mandatory training', { bold: true });
  forEachCellInRange(trainingByStaffTab, 'B3:L3', (cell) => {
    cell.style = tableHeaderCellStyle;
  });

  const tableRange = addWorkerTable(trainingByStaffTab, workerTrainingBreakdowns);

  addFootNote(trainingByStaffTab);

  setHeightsAndWidths(trainingByStaffTab, tableRange);
};

const addWorkerTable = (tab, workerTrainingBreakdowns) => {
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

  const table = tab.addTable({
    name: 'trainingByStaffTable',
    ref: 'B4',
    columns: tableColumnNames.map((name) => ({ name, filterButton: true, totalsRowFunction: 'sum' })),
    rows: [],
    totalsRow: true,
    showFirstColumn: true,
  });

  workerTrainingBreakdowns.forEach((worker) => {
    table.addRow([
      worker.name,
      worker.trainingCount,
      worker.expiredMandatoryTrainingCount,
      worker.expiringMandatoryTrainingCount,
      worker.upToDateMandatoryTrainingCount,
      worker.mandatoryTrainingCount,
      worker.missingMandatoryTrainingCount,
      worker.expiredNonMandatoryTrainingCount,
      worker.expiringNonMandatoryTrainingCount,
      worker.upToDateNonMandatoryTrainingCount,
      worker.nonMandatoryTrainingCount,
    ]);
  });

  table.commit();

  const tableRange = table.model.tableRef;

  // delete the table object and fill in column names manually, as Excel table does not allow duplicated header column names
  tab.removeTable('trainingByStaffTable');
  const headerRow = tab.getRow(4);
  headerRow.values = ['', ...tableColumnNames];

  setStyleForWorkerTable(tab, tableRange);

  const totalRow = tab.lastRow;
  totalRow.eachCell((cell, cellNumber) => {
    if (cellNumber < 3) {
      return;
    }
    const columnLabel = colCache.n2l(cellNumber);
    const firstWorkerCell = `${columnLabel}5`;
    const lastWorkerCell = `${columnLabel}${totalRow.number - 1}`;
    cell.value = { formula: `SUM(${firstWorkerCell}:${lastWorkerCell})` };
  });

  return tableRange;
};

const setStyleForWorkerTable = (tab, tableRange) => {
  setBasicTableStyle(tab, tableRange, { bold: true });

  const headerRow = tab.getRow(4);

  const headerCellWorkerName = tab.getCell(4, headerRow.values.indexOf('Name or ID number'));
  setColourForCell(headerCellWorkerName, { backgroundColour: newBackgroundColours.lightGrey });

  const headerCellWhiteTextOnBlack = tab.getCell(4, headerRow.values.indexOf('Total'));
  setColourForCell(headerCellWhiteTextOnBlack, {
    backgroundColour: newBackgroundColours.black,
    textColour: newTextColours.white,
  });

  tab.addConditionalFormatting({
    ref: 'D4:L4',
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

  const workerColumnNum = headerRow.values.indexOf('Name or ID number');
  const { top, bottom } = colCache.decode(tableRange);
  const workerColumnRange = colCache.encode(top, workerColumnNum, bottom, workerColumnNum);

  forEachCellInRange(tab, workerColumnRange, (cell) => {
    cell.style = lodash.merge({}, cell.style, { alignment: { horizontal: 'left' }, font: { bold: false } });
  });

  tab.getCell(top, workerColumnNum).font.bold = true;
  tab.getCell(bottom, workerColumnNum).font.bold = true;
};

const addFootNote = (tab) => {
  tab.addRow(['', 'The figures shown could include records of staff who have been flagged as long-term absent.']);
  tab.addRow(['', 'Note, the number in the Missing column may include training not yet taken by new starters.']);
};

const setHeightsAndWidths = (tab) => {
  const columnWidths = [6.8, 26.8, Array(10).fill(12)].flat();
  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  const rowHeights = [47, 19, 22, 38];

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });
};

module.exports = { generateTrainingByStaffTab };
