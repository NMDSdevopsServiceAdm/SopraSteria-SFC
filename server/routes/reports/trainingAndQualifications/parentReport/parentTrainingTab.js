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
  }

  trainingTable.commit();
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

module.exports.generateTrainingTab = generateTrainingTab;
module.exports.addContentToTrainingTab = addContentToTrainingTab;
