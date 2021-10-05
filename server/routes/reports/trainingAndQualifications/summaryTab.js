const { addHeading, addLine } = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateSummaryTab = async (workbook, establishmentId) => {
  const workers = await models.worker.workersAndTraining(establishmentId);
  const convertedWorkers = workers.map((worker) => {
    return convertWorker(worker);
  });

  const summaryTab = workbook.addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });

  addHeading(summaryTab, 'B2', 'E2', 'Training (summary)');
  addLine(summaryTab, 'A4', 'E4');

  const allTrainingRecordsTable = createAllTrainingRecordsTable(summaryTab);

  let currentLineNumber = convertedWorkers.length + 9;

  const expiringSoonTable = createExpiringSoonTable(summaryTab, currentLineNumber);

  currentLineNumber = currentLineNumber + convertedWorkers.length + 3;
  const expiredTable = createExpiredTable(summaryTab, currentLineNumber);

  currentLineNumber = currentLineNumber + convertedWorkers.length + 3;
  const missingTable = createMissingTable(summaryTab, currentLineNumber);

  for (let worker of convertedWorkers) {
    allTrainingRecordsTable.addRow([worker.name, worker.trainingCount]);
    expiringSoonTable.addRow([worker.name, worker.expiringTrainingCount]);
    expiredTable.addRow([
      worker.name,
      worker.expiredTrainingCount,
      worker.expiredMandatoryTrainingCount,
      worker.expiredNonMandatoryTrainingCount,
    ]);
    missingTable.addRow([worker.name, worker.missingMandatoryTrainingCount]);
  }
  allTrainingRecordsTable.commit();
  expiringSoonTable.commit();
  expiredTable.commit();
  missingTable.commit();
};

const createAllTrainingRecordsTable = (tab) => {
  return tab.addTable({
    name: 'allTrainingRecordsTable',
    ref: 'B6',
    headerRow: true,
    columns: [
      { name: 'All training records', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
    ],
    rows: [],
  });
};

const createExpiringSoonTable = (tab, lineNumber) => {
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
    rows: [],
  });
};

const createExpiredTable = (tab, lineNumber) => {
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
    rows: [],
  });
};

const createMissingTable = (tab, lineNumber) => {
  return tab.addTable({
    name: 'missingTable',
    ref: 'B' + lineNumber,
    headerRow: true,
    columns: [
      { name: 'Missing', filterButton: false },
      { name: 'Total', filterButton: false },
    ],
    rows: [],
  });
};

const convertWorker = (worker) => {
  return {
    name: worker.get('NameOrIdValue'),
    trainingCount: worker.get('trainingCount'),
    qualificationCount: worker.get('qualificationCount'),
    expiredTrainingCount: worker.get('expiredTrainingCount'),
    expiredMandatoryTrainingCount: worker.get('expiredMandatoryTrainingCount'),
    expiredNonMandatoryTrainingCount: worker.get('expiredNonMandatoryTrainingCount'),
    expiringTrainingCount: worker.get('expiringTrainingCount'),
    missingMandatoryTrainingCount: worker.get('missingMandatoryTrainingCount'),
  };
};

module.exports.generateSummaryTab = generateSummaryTab;
