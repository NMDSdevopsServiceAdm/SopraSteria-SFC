const { convertWorkersWithTrainingRecords } = require('../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  backgroundColours,
  textColours,
  setTableHeadingsStyle,
  addBordersToAllFilledCells,
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

  const trainingTable = createTrainingTable(trainingTab);
  addRowsToTrainingTable(trainingTable, workersWithTraining);
  addBordersToAllFilledCells(trainingTab, 5);
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

const addRowsToTrainingTable = (trainingTable, workers) => {
  for (let worker of workers) {
    for (let trainingRecord of worker.workerTraining) {
      addRow(trainingTable, worker, trainingRecord);
    }
  }

  trainingTable.commit();
};

const addRow = (trainingTable, worker, trainingRecord) => {
  trainingTable.addRow([
    worker.workerId,
    worker.jobRole,
    trainingRecord.get('CategoryFK'),
    trainingRecord.get('Title'),
    'Mandatory',
    'Missing',
    trainingRecord.get('Expires'),
    trainingRecord.get('Completed'),
    worker.longTermAbsence,
    trainingRecord.get('Accredited'),
  ]);
};

module.exports.generateTrainingTab = generateTrainingTab;
module.exports.addContentToTrainingTab = addContentToTrainingTab;
