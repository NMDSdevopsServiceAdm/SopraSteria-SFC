const { addHeading, addLine } = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateSummaryTab = async (workbook, establishmentId) => {
  const summaryTab = workbook.addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });

  addHeading(summaryTab, 'B2', 'E2', 'Training (summary)');
  addLine(summaryTab, 'A4', 'E4');

  const expiringSoonTable = summaryTab.addTable({
    name: 'expiringSoonTable',
    ref: 'B6',
    headerRow: true,
    columns: [
      { name: 'Expiring soon', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
    ],
    rows: [],
  });

  const workers = await models.worker.workersAndTraining(establishmentId);
  const convertedWorkers = workers.map((worker) => {
    return {
      name: worker.get('NameOrIdValue'),
      trainingCount: worker.get('trainingCount'),
      qualificationCount: worker.get('qualificationCount'),
      expiredTrainingCount: worker.get('expiredTrainingCount'),
      expiringTrainingCount: worker.get('expiringTrainingCount'),
      missingMandatoryTrainingCount: worker.get('missingMandatoryTrainingCount'),
    };
  });

  for (let worker of convertedWorkers) {
    expiringSoonTable.addRow([worker.name, worker.expiringTrainingCount]);
  }

  expiringSoonTable.commit();
};

module.exports.generateSummaryTab = generateSummaryTab;
