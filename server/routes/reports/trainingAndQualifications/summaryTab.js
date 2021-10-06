const { addHeading, addLine } = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateSummaryTab = async (workbook, establishmentId) => {
  const workers = await models.worker.workersAndTraining(establishmentId);
  const convertedWorkers = workers.map((worker) => {
    return convertWorker(worker);
  });

  const trainingRecordTotals = getTrainingTotals(convertedWorkers);

  const summaryTab = workbook.addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });

  addHeading(summaryTab, 'B2', 'E2', 'Training (summary)');
  addLine(summaryTab, 'A4', 'E4');

  createAllTrainingRecordsTable(summaryTab, trainingRecordTotals);

  let currentLineNumber = 13;

  const expiringSoonTable = createExpiringSoonTable(summaryTab, currentLineNumber, trainingRecordTotals.expiringSoon);

  currentLineNumber = currentLineNumber + convertedWorkers.length + 4;
  const expiredTable = createExpiredTable(summaryTab, currentLineNumber, trainingRecordTotals.expired);

  currentLineNumber = currentLineNumber + convertedWorkers.length + 4;
  const missingTable = createMissingTable(summaryTab, currentLineNumber, trainingRecordTotals.missing);

  addRowsToTables(convertedWorkers, expiringSoonTable, expiredTable, missingTable);

  setColumnsWidths(summaryTab);
  addBordersToAllTables(summaryTab);
};

const createAllTrainingRecordsTable = (tab, trainingRecordTotals) => {
  setHeadingAndTotalRowStyles(tab, 6, blueBackgroundColour, whiteTextColour, ['B', 'C', 'D', 'E']);

  const allTrainingRecordsTable = tab.addTable({
    name: 'allTrainingRecordsTable',
    ref: 'B6',
    headerRow: true,
    columns: [
      { name: 'All training records', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
    ],
    rows: [
      [
        'Total',
        trainingRecordTotals.total.totalRecords,
        trainingRecordTotals.total.mandatory,
        trainingRecordTotals.total.nonMandatory,
      ],
      [
        'Up-to-date',
        trainingRecordTotals.upToDate.total,
        trainingRecordTotals.upToDate.mandatory,
        trainingRecordTotals.upToDate.nonMandatory,
      ],
      [
        'Expiring soon',
        trainingRecordTotals.expiringSoon.total,
        trainingRecordTotals.expiringSoon.mandatory,
        trainingRecordTotals.expiringSoon.nonMandatory,
      ],
      [
        'Expired',
        trainingRecordTotals.expired.total,
        trainingRecordTotals.expired.mandatory,
        trainingRecordTotals.expired.nonMandatory,
      ],
    ],
  });

  setCellColourAndBackgroundColour(tab, 'B8', greenBackgroundColour, greenTextColour);
  setCellColourAndBackgroundColour(tab, 'B9', yellowBackgroundColour, yellowTextColour);
  setCellColourAndBackgroundColour(tab, 'B10', redBackgroundColour, redTextColour);

  return allTrainingRecordsTable;
};

const createExpiringSoonTable = (tab, lineNumber, expiringTrainingTotals) => {
  setHeadingAndTotalRowStyles(tab, lineNumber, yellowBackgroundColour, yellowTextColour, ['B', 'C', 'D', 'E']);

  return tab.addTable({
    name: 'expiringSoonTable',
    ref: 'B' + lineNumber,
    headerRow: true,

    columns: [
      { name: 'Expiring soon', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
    ],
    rows: [
      ['Total', expiringTrainingTotals.total, expiringTrainingTotals.mandatory, expiringTrainingTotals.nonMandatory],
    ],
  });
};

const createExpiredTable = (tab, lineNumber, expiredTrainingTotals) => {
  setHeadingAndTotalRowStyles(tab, lineNumber, redBackgroundColour, redTextColour, ['B', 'C', 'D', 'E']);

  return tab.addTable({
    name: 'expiredTable',
    ref: 'B' + lineNumber,
    headerRow: true,
    columns: [
      { name: 'Expired', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
    ],
    rows: [['Total', expiredTrainingTotals.total, expiredTrainingTotals.mandatory, expiredTrainingTotals.nonMandatory]],
  });
};

const createMissingTable = (tab, lineNumber, totalMissingMandatoryTraining) => {
  setHeadingAndTotalRowStyles(tab, lineNumber, redBackgroundColour, redTextColour, ['B', 'C']);

  const missingTable = tab.addTable({
    name: 'missingTable',
    ref: 'B' + lineNumber,
    headerRow: true,
    columns: [
      { name: 'Missing', filterButton: false },
      { name: 'Total', filterButton: false },
    ],
    rows: [['Total', totalMissingMandatoryTraining]],
  });
  return missingTable;
};

const convertWorker = (worker) => {
  return {
    name: worker.get('NameOrIdValue'),
    trainingCount: parseInt(worker.get('trainingCount')),
    qualificationCount: parseInt(worker.get('qualificationCount')),
    expiredTrainingCount: parseInt(worker.get('expiredTrainingCount')),
    expiredMandatoryTrainingCount: parseInt(worker.get('expiredMandatoryTrainingCount')),
    expiredNonMandatoryTrainingCount: parseInt(worker.get('expiredNonMandatoryTrainingCount')),
    expiringTrainingCount: parseInt(worker.get('expiringTrainingCount')),
    expiringMandatoryTrainingCount: parseInt(worker.get('expiringMandatoryTrainingCount')),
    missingMandatoryTrainingCount: parseInt(worker.get('missingMandatoryTrainingCount')),
    expiringNonMandatoryTrainingCount: parseInt(worker.get('expiringNonMandatoryTrainingCount')),
    mandatoryTrainingCount: parseInt(worker.get('mandatoryTrainingCount')),
  };
};

const getTrainingTotals = (workers) => {
  const expiredTotalRecords = workers.map((worker) => worker.expiredTrainingCount).reduce((a, b) => a + b, 0);
  const expiredTotalMandatory = workers
    .map((worker) => worker.expiredMandatoryTrainingCount)
    .reduce((a, b) => a + b, 0);

  const expiringTotalRecords = workers.map((worker) => worker.expiringTrainingCount).reduce((a, b) => a + b, 0);
  const expiringTotalMandatory = workers
    .map((worker) => worker.expiringMandatoryTrainingCount)
    .reduce((a, b) => a + b, 0);

  const totalRecords = workers.map((worker) => worker.trainingCount).reduce((a, b) => a + b, 0);
  const totalMandatoryRecords = workers.map((worker) => worker.mandatoryTrainingCount).reduce((a, b) => a + b, 0);

  const upToDateTotalRecords = totalRecords - expiringTotalRecords - expiredTotalRecords;
  const upToDateTotalMandatory = totalMandatoryRecords - expiringTotalMandatory - expiredTotalMandatory;
  const upToDateTotalNonMandatory = upToDateTotalRecords - upToDateTotalMandatory;

  return {
    total: {
      mandatory: totalMandatoryRecords,
      nonMandatory: totalRecords - totalMandatoryRecords,
      totalRecords,
    },
    upToDate: {
      total: upToDateTotalRecords,
      mandatory: upToDateTotalMandatory,
      nonMandatory: upToDateTotalNonMandatory,
    },
    expiringSoon: {
      mandatory: expiringTotalMandatory,
      nonMandatory: expiringTotalRecords - expiringTotalMandatory,
      total: expiringTotalRecords,
    },
    expired: {
      mandatory: expiredTotalMandatory,
      nonMandatory: expiredTotalRecords - expiredTotalMandatory,
      total: expiredTotalRecords,
    },
    missing: workers.map((worker) => worker.missingMandatoryTrainingCount).reduce((a, b) => a + b, 0),
  };
};

const addRowsToTables = (workers, expiringSoonTable, expiredTable, missingTable) => {
  for (let worker of workers) {
    expiringSoonTable.addRow([
      worker.name,
      worker.expiringTrainingCount,
      worker.expiringMandatoryTrainingCount,
      worker.expiringNonMandatoryTrainingCount,
    ]);
    expiredTable.addRow([
      worker.name,
      worker.expiredTrainingCount,
      worker.expiredMandatoryTrainingCount,
      worker.expiredNonMandatoryTrainingCount,
    ]);
    missingTable.addRow([worker.name, worker.missingMandatoryTrainingCount]);
  }

  expiringSoonTable.commit();
  expiredTable.commit();
  missingTable.commit();
};

const setColumnsWidths = (tab) => {
  const firstColumn = tab.getColumn(2);
  const totalColumn = tab.getColumn(3);
  const mandatoryColumn = tab.getColumn(4);
  const nonMandatoryColumn = tab.getColumn(5);

  firstColumn.width = 24;
  totalColumn.width = 18;
  mandatoryColumn.width = 18;
  nonMandatoryColumn.width = 18;
};

const setHeadingAndTotalRowStyles = (tab, currentLineNumber, backgroundColour, textColour, cellLetters) => {
  tab.getRow(currentLineNumber).font = { bold: true, color: textColour };
  tab.getRow(currentLineNumber).alignment = { vertical: 'middle', horizontal: 'center' };

  tab.getRow(currentLineNumber + 1).style = { font: { bold: true } };

  cellLetters.map((key) => {
    tab.getCell(key + currentLineNumber).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: backgroundColour,
    };
  });
};

const addBordersToAllTables = (tab) => {
  tab.eachRow(function (row, _rowNumber) {
    if (_rowNumber > 5) {
      row.eachCell(function (cell) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  });
};

const setCellColourAndBackgroundColour = (tab, cellCoordinate, backgroundColour, textColour) => {
  const cell = tab.getCell(cellCoordinate);
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: backgroundColour,
  };

  cell.font = { color: textColour };
};

const yellowBackgroundColour = { argb: 'FFEA99' };
const yellowTextColour = { argb: '945B19' };
const blueBackgroundColour = { argb: '0050AB' };
const whiteTextColour = { argb: 'FFFFFF' };
const redBackgroundColour = { argb: 'FFC0C8' };
const redTextColour = { argb: '960512' };
const greenBackgroundColour = { argb: 'BBEDC9' };
const greenTextColour = { argb: '005713' };

module.exports.generateSummaryTab = generateSummaryTab;
