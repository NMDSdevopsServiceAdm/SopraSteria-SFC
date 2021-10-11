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

  const mandatoryTrainingCategories = await models.MandatoryTraining.findMandatoryTrainingCategoriesForEstablishment(
    establishmentId,
  );

  const trainingTab = workbook.addWorksheet('Training', { views: [{ showGridLines: false }] });

  addContentToTrainingTab(trainingTab, workersWithTraining, mandatoryTrainingCategories);
};

const addContentToTrainingTab = (trainingTab, workersWithTraining, mandatoryTrainingCategories) => {
  addHeading(trainingTab, 'B2', 'E2', 'Training');
  addLine(trainingTab, 'A4', 'K4');
  alignColumnToLeft(trainingTab, 2);

  const trainingTable = createTrainingTable(trainingTab);
  addRowsToTrainingTable(trainingTable, workersWithTraining, mandatoryTrainingCategories);
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

const addRowsToTrainingTable = (trainingTable, workers, mandatoryTrainingCategories) => {
  for (let worker of workers) {
    for (let trainingRecord of worker.workerTraining) {
      addRow(trainingTable, worker, trainingRecord, mandatoryTrainingCategories);
    }

    addRowsForWorkerMissingTraining(trainingTable, worker, mandatoryTrainingCategories);
  }

  trainingTable.commit();
};

const addRowsForWorkerMissingTraining = (trainingTable, worker, mandatoryTrainingCategories) => {
  for (let category of mandatoryTrainingCategories) {
    if (!hasMandatoryTrainingRecord(worker, category.trainingCategoryFK)) {
      addMissingRow(trainingTable, worker, category.trainingCategoryFK);
    }
  }
};

const addMissingRow = (trainingTable, worker, trainingCategory) => {
  trainingTable.addRow([
    worker.workerId,
    worker.jobRole,
    trainingCategory,
    '',
    'Mandatory',
    'Missing',
    '',
    '',
    worker.longTermAbsence,
    '',
  ]);
};

const addRow = (trainingTable, worker, trainingRecord, mandatoryTrainingCategories) => {
  trainingTable.addRow([
    worker.workerId,
    worker.jobRole,
    trainingRecord.category,
    trainingRecord.trainingName,
    isMandatoryTraining(trainingRecord.categoryFK, mandatoryTrainingCategories) ? 'Mandatory' : 'Not mandatory',
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

const isMandatoryTraining = (trainingCategoryFK, mandatoryTrainingCategories) => {
  return mandatoryTrainingCategories.find((category) => category.trainingCategoryFK === trainingCategoryFK);
};

const hasMandatoryTrainingRecord = (worker, trainingCategoryFK) => {
  return worker.workerTraining.find((record) => record.trainingCategoryFK === trainingCategoryFK);
};

module.exports.generateTrainingTab = generateTrainingTab;
module.exports.addContentToTrainingTab = addContentToTrainingTab;
