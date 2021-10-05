const { addHeading, addLine } = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateSummaryTab = async (workbook, establishmentId) => {
  const workers = await models.worker.workersAndTraining(establishmentId);
  const convertedWorkers = workers.map((worker) => {
    return convertWorker(worker);
  });

  const totalMissingMandatoryTraining = convertedWorkers
    .map((worker) => worker.missingMandatoryTrainingCount)
    .reduce((a, b) => a + b, 0);
  const total = convertedWorkers.map((worker) => worker.expiredTrainingCount).reduce((a, b) => a + b, 0);
  const totalMandatory = convertedWorkers
    .map((worker) => worker.expiredMandatoryTrainingCount)
    .reduce((a, b) => a + b, 0);
  const expiredTrainingTotals = {
    total,
    totalMandatory,
    totalNonMandatory: total - totalMandatory,
  };

  const totalExpiring = convertedWorkers.map((worker) => worker.expiringTrainingCount).reduce((a, b) => a + b, 0);
  const totalExpiringMandatory = convertedWorkers
    .map((worker) => worker.expiringMandatoryTrainingCount)
    .reduce((a, b) => a + b, 0);
  const expiringTrainingTotals = {
    total: totalExpiring,
    totalMandatory: totalExpiringMandatory,
    totalNonMandatory: totalExpiring - totalExpiringMandatory,
  };

  const totalTrainingRecords = convertedWorkers.map((worker) => worker.trainingCount).reduce((a, b) => a + b, 0);
  const totalUpToDateRecords = totalTrainingRecords - expiringTrainingTotals.total - expiredTrainingTotals.total;

  const summaryTab = workbook.addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });

  addHeading(summaryTab, 'B2', 'E2', 'Training (summary)');
  addLine(summaryTab, 'A4', 'E4');

  const allTrainingRecordsTable = createAllTrainingRecordsTable(
    summaryTab,
    expiredTrainingTotals,
    expiringTrainingTotals,
    totalTrainingRecords,
    totalUpToDateRecords,
  );

  let currentLineNumber = 13;

  const expiringSoonTable = createExpiringSoonTable(summaryTab, currentLineNumber, expiringTrainingTotals);

  currentLineNumber = currentLineNumber + convertedWorkers.length + 4;
  const expiredTable = createExpiredTable(summaryTab, currentLineNumber, expiredTrainingTotals);

  currentLineNumber = currentLineNumber + convertedWorkers.length + 4;
  const missingTable = createMissingTable(summaryTab, currentLineNumber, totalMissingMandatoryTraining);

  for (let worker of convertedWorkers) {
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
  allTrainingRecordsTable.commit();
  expiringSoonTable.commit();
  expiredTable.commit();
  missingTable.commit();
};

const createAllTrainingRecordsTable = (
  tab,
  expiredTrainingTotals,
  expiringTrainingTotals,
  totalTrainingRecords,
  totalUpToDateRecords,
) => {
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
    rows: [
      ['Total', totalTrainingRecords],
      ['Up-to-date', totalUpToDateRecords],
      [
        'Expiring soon',
        expiringTrainingTotals.total,
        expiringTrainingTotals.totalMandatory,
        expiringTrainingTotals.totalNonMandatory,
      ],
      [
        'Expired',
        expiredTrainingTotals.total,
        expiredTrainingTotals.totalMandatory,
        expiredTrainingTotals.totalNonMandatory,
      ],
    ],
  });
};

const createExpiringSoonTable = (tab, lineNumber, expiringTrainingTotals) => {
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
      [
        'Total',
        expiringTrainingTotals.total,
        expiringTrainingTotals.totalMandatory,
        expiringTrainingTotals.totalNonMandatory,
      ],
    ],
  });
};

const createExpiredTable = (tab, lineNumber, expiredTrainingTotals) => {
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
    rows: [
      [
        'Total',
        expiredTrainingTotals.total,
        expiredTrainingTotals.totalMandatory,
        expiredTrainingTotals.totalNonMandatory,
      ],
    ],
  });
};

const createMissingTable = (tab, lineNumber, totalMissingMandatoryTraining) => {
  return tab.addTable({
    name: 'missingTable',
    ref: 'B' + lineNumber,
    headerRow: true,
    columns: [
      { name: 'Missing', filterButton: false },
      { name: 'Total', filterButton: false },
    ],
    rows: [['Total', totalMissingMandatoryTraining]],
  });
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
  };
};

module.exports.generateSummaryTab = generateSummaryTab;
