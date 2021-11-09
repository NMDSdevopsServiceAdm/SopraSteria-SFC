const { convertTrainingForEstablishments } = require('../../../utils/trainingAndQualificationsUtils');
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
  addBlankRowIfTableEmpty,
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateTrainingTab = async (workbook, establishmentId, isParent = false) => {
  const rawEstablishments = await models.establishment.getEstablishmentTrainingRecords(establishmentId, isParent);
  const establishments = convertTrainingForEstablishments(rawEstablishments);

  const trainingTab = workbook.addWorksheet('Training', { views: [{ showGridLines: false }] });

  addContentToTrainingTab(trainingTab, establishments, isParent);
};

const addContentToTrainingTab = (trainingTab, establishments, isParent) => {
  addHeading(trainingTab, 'B2', 'E2', 'Training');
  addLine(trainingTab, 'A4',isParent ? 'L4' : 'K4');
  alignColumnToLeft(trainingTab, 2);
  if (isParent) alignColumnToLeft(trainingTab, 3);


  const trainingTable = createTrainingTable(trainingTab, isParent);
  addRowsToTrainingTable(trainingTable, establishments, isParent);


  addBordersToAllFilledCells(trainingTab, 5);
  addColoursToStatusColumn(trainingTab, isParent);
  fitColumnsToSize(trainingTab, 2, 5.5);
};

const createTrainingTable = (trainingTab, isParent) => {
  const headingColumns = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  if (isParent) headingColumns.push('L');

  setTableHeadingsStyle(trainingTab, 6, backgroundColours.blue, textColours.white, headingColumns);

  const columns = [
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
  ];

  if (isParent) {
    columns.unshift({ name: 'Workplace', filterButton: true });
  }

  return trainingTab.addTable({
    name: 'trainingTable',
    ref: 'B6',
    columns,
    rows: [],
  });
};

const addRowsToTrainingTable = (trainingTable, establishments, isParent) => {
  for (let establishment of establishments) {
    for (let workerRecord of establishment.workerRecords) {
      for (let trainingRecord of workerRecord.trainingRecords) {
        addRow(trainingTable, establishment, workerRecord, trainingRecord, isParent);
      }
      addRowsForWorkerMissingTraining(trainingTable, workerRecord, establishment, isParent);
    }
  }

  addBlankRowIfTableEmpty(trainingTable, 11);

  trainingTable.commit();
};

const addRowsForWorkerMissingTraining = (trainingTable, worker, establishment, isParent) => {
  for (let record of worker.mandatoryTraining) {
    if (!hasTrainingRecord(worker.trainingRecords, record)) {
      addMissingRow(trainingTable, worker, record, establishment, isParent);
    }
  }
};

const addMissingRow = (trainingTable, worker, missingMandatoryTrainingRecord, establishment, isParent) => {
  const row = [
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
  ];

  if (isParent) {
    row.unshift(establishment.name);
  }

  trainingTable.addRow(row);
};

const addRow = (trainingTable, establishment, workerRecord, trainingRecord,isParent) => {
  const row = [
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
  ];

  if (isParent) {
    row.unshift(establishment.name);
  }
  trainingTable.addRow(row);
};

const addColoursToStatusColumn = (trainingTab, isParent) => {
  trainingTab.eachRow(function (row, rowNumber) {
    const statusCell = isParent ? row.getCell('H') : row.getCell('G');
    const currentCell = isParent ?  `H${rowNumber}` : `G${rowNumber}`;
    if (statusCell.value === 'Up-to-date') {
      setCellTextAndBackgroundColour(trainingTab, currentCell, backgroundColours.green, textColours.green);
    } else if (statusCell.value === 'Expiring soon') {
      setCellTextAndBackgroundColour(trainingTab, currentCell, backgroundColours.yellow, textColours.yellow);
    } else if (statusCell.value === 'Expired' || statusCell.value === 'Missing') {
      setCellTextAndBackgroundColour(trainingTab, currentCell, backgroundColours.red, textColours.red);
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
