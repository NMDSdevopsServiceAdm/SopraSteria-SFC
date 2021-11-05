const { convertParentWorkersWithTrainingRecords } = require('../../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  backgroundColours,
  textColours,
  setTableHeadingsStyle,
  fitColumnsToSize,
  alignColumnToLeft,
  addBordersToAllFilledCells,
  setCellTextAndBackgroundColour,
  addBlankRowIfTableEmpty,
} = require('../../../../utils/excelUtils');
const models = require('../../../../models');
const generateTrainingTab = async (workbook, establishmentId) => {
  const trainingTab = workbook.addWorksheet('Training', { views: [{ showGridLines: false }] });
  const rawWorkersWithTraining = await models.establishment.getEstablishmentTrainingRecords([establishmentId], true);
  const workersWithTraining = convertParentWorkersWithTrainingRecords(rawWorkersWithTraining);

  addContentToTrainingTab(trainingTab, workersWithTraining);
};

const addContentToTrainingTab = (trainingTab, workersWithTraining) => {
  addHeading(trainingTab, 'B2', 'E2', 'Training');
  addLine(trainingTab, 'A4', 'L4');
  alignColumnToLeft(trainingTab, 2);
  alignColumnToLeft(trainingTab, 3);

  const trainingTable = createTrainingTable(trainingTab, workersWithTraining);
  addRowsToTrainingTable(trainingTable, workersWithTraining);

  addBordersToAllFilledCells(trainingTab, 5);
  addColoursToStatusColumn(trainingTab);
  fitColumnsToSize(trainingTab, 2, 5.5);
};

const createTrainingTable = (trainingTab) => {
  const tableColumns = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  setTableHeadingsStyle(trainingTab, 6, backgroundColours.blue, textColours.white, tableColumns);

  return trainingTab.addTable({
    name: 'trainingTable',
    ref: 'B6',
    columns: [
      { name: 'Workplace', filterButton: true },
      { name: 'Worker ID', filterButton: true },
      { name: 'Job role', filterButton: true },
      { name: 'Training category', filterButton: true },
      { name: 'Training name', filterButton: true },
      { name: 'Mandatory', filterButton: true },
      { name: 'Status', filterButton: true },
      { name: 'Expiry date', filterButton: true },
      { name: 'Date completed', filterButton: true },
      { name: 'Long-term absence', filterButton: true },
      { name: 'Accredited', filterButton: true },
    ],
    rows: [],
  });
};

const addRowsToTrainingTable = (trainingTable, establishment) => {
  for (let workers of establishment) {
    for (let workerRecord of workers.workerRecords) {
      for (let trainingRecord of workerRecord.trainingRecords) {
        addRow(trainingTable, workers, workerRecord, trainingRecord);
      }
    }
    addRowsForWorkerMissingTraining(trainingTable, workers);
  }
  addBlankRowIfTableEmpty(trainingTable, 11);

  trainingTable.commit();
};

const addRowsForWorkerMissingTraining = (trainingTable, worker) => {
  for (let workerRecord of worker.workerRecords) {
    for (let record of workerRecord.mandatoryTraining) {
      if (!hasTrainingRecord(workerRecord.trainingRecords, record)) {
        addMissingRow(trainingTable, worker, workerRecord, record);
      }
    }
  }
};

const addMissingRow = (trainingTable, worker, workerRecord, missingMandatoryTrainingRecord) => {
  trainingTable.addRow([
    worker.workPlace,
    workerRecord.workerId,
    workerRecord.jobRole,
    missingMandatoryTrainingRecord,
    '',
    'Mandatory',
    'Missing',
    '',
    '',
    workerRecord.longTermAbsence,
    '',
  ]);
};

const addRow = (trainingTable, workers, workerRecord, trainingRecord) => {
  trainingTable.addRow([
    workers.workPlace,
    workerRecord.workerId,
    workerRecord.jobRole,
    trainingRecord.category,
    trainingRecord.trainingName,
    isMandatoryTraining(trainingRecord.category, workerRecord.mandatoryTraining) ? 'Mandatory' : 'Not mandatory',
    trainingRecord.status,
    trainingRecord.expiryDate,
    trainingRecord.dateCompleted,
    workerRecord.longTermAbsence,
    trainingRecord.accredited,
  ]);
};

const addColoursToStatusColumn = (trainingTab) => {
  trainingTab.eachRow(function (row, rowNumber) {
    const statusCell = row.getCell('H');
    if (statusCell.value === 'Up-to-date') {
      setCellTextAndBackgroundColour(trainingTab, `H${rowNumber}`, backgroundColours.green, textColours.green);
    } else if (statusCell.value === 'Expiring soon') {
      setCellTextAndBackgroundColour(trainingTab, `H${rowNumber}`, backgroundColours.yellow, textColours.yellow);
    } else if (statusCell.value === 'Expired' || statusCell.value === 'Missing') {
      setCellTextAndBackgroundColour(trainingTab, `H${rowNumber}`, backgroundColours.red, textColours.red);
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
