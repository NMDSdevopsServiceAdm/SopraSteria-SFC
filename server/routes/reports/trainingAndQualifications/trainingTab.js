const { convertWorkersWithTrainingRecords } = require('../../../utils/trainingAndQualificationsUtils');
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
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateTrainingTab = async (workbook, establishmentId) => {
  const rawWorkersWithTraining = await models.worker.getEstablishmentTrainingRecords(establishmentId);
  const workersWithTraining = convertWorkersWithTrainingRecords(rawWorkersWithTraining);

  const trainingTab = workbook.addWorksheet('Training', { views: [{ showGridLines: false }] });

  addContentToTrainingTab(trainingTab, workersWithTraining);
};

const addContentToTrainingTab = (trainingTab, workersWithTraining) => {
  addHeading(trainingTab, 'B2', 'E2', 'Training');
  addLine(trainingTab, 'A4', 'K4');
  alignColumnToLeft(trainingTab, 2);

  const trainingTable = createTrainingTable(trainingTab);
  addRowsToTrainingTable(trainingTable, workersWithTraining);

  addBordersToAllFilledCells(trainingTab, 5);
  addColoursToStatusColumn(trainingTab);
  fitColumnsToSize(trainingTab, 2);

  trainingTab.autoFilter = 'B6:K6';
};

const createTrainingTable = (trainingTab) => {
  setTableHeadingsStyle(trainingTab, 6, backgroundColours.blue, textColours.white, [
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
  ]);

  return trainingTab.addTable({
    name: 'expiringSoonTable',
    ref: 'B6',
    headerRow: true,
    columns: [
      { name: 'Worker ID' },
      { name: 'Job role' },
      { name: 'Training category' },
      { name: 'Training name' },
      { name: 'Mandatory' },
      { name: 'Status' },
      { name: 'Expiry date' },
      { name: 'Date completed' },
      { name: 'Long-term absence' },
      { name: 'Accredited' },
    ],
    rows: [],
  });
};

const addRowsToTrainingTable = (trainingTable, workers) => {
  for (let worker of workers) {
    for (let trainingRecord of worker.trainingRecords) {
      addRow(trainingTable, worker, trainingRecord);
    }

    addRowsForWorkerMissingTraining(trainingTable, worker);
  }

  trainingTable.commit();
};

const addRowsForWorkerMissingTraining = (trainingTable, worker) => {
  for (let record of worker.mandatoryTraining) {
    if (!hasTrainingRecord(worker.trainingRecords, record)) {
      addMissingRow(trainingTable, worker, record);
    }
  }
};

const addMissingRow = (trainingTable, worker, missingMandatoryTrainingRecord) => {
  trainingTable.addRow([
    worker.workerId,
    worker.jobRole,
    missingMandatoryTrainingRecord,
    '',
    'Mandatory',
    'Missing',
    '',
    '',
    worker.longTermAbsence,
    '',
  ]);
};

const addRow = (trainingTable, worker, trainingRecord) => {
  trainingTable.addRow([
    worker.workerId,
    worker.jobRole,
    trainingRecord.category,
    trainingRecord.trainingName,
    isMandatoryTraining(trainingRecord.category, worker.mandatoryTraining) ? 'Mandatory' : 'Not mandatory',
    trainingRecord.status,
    trainingRecord.expiryDate,
    trainingRecord.dateCompleted,
    worker.longTermAbsence,
    trainingRecord.accredited,
  ]);
};

const addColoursToStatusColumn = (trainingTab) => {
  trainingTab.eachRow(function (row, rowNumber) {
    const statusCell = row.getCell('G');
    if (statusCell.value === 'Up-to-date') {
      setCellTextAndBackgroundColour(trainingTab, `G${rowNumber}`, backgroundColours.green, textColours.green);
    } else if (statusCell.value === 'Expiring soon') {
      setCellTextAndBackgroundColour(trainingTab, `G${rowNumber}`, backgroundColours.yellow, textColours.yellow);
    } else if (statusCell.value === 'Expired' || statusCell.value === 'Missing') {
      setCellTextAndBackgroundColour(trainingTab, `G${rowNumber}`, backgroundColours.red, textColours.red);
    }
  });
};

const isMandatoryTraining = (trainingCategory, mandatoryTraining) => {
  return mandatoryTraining.includes(trainingCategory);
};

const hasTrainingRecord = (trainingRecords, trainingCategory) => {
  return trainingRecords.find((record) => record.category === trainingCategory);
};

module.exports.generateTrainingTab = generateTrainingTab;
module.exports.addContentToTrainingTab = addContentToTrainingTab;
