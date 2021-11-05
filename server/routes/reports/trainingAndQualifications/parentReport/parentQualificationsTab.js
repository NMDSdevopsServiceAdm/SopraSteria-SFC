const { convertWorkerQualifications } = require('../../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  backgroundColours,
  textColours,
  setTableHeadingsStyle,
  alignColumnToLeft,
  fitColumnsToSize,
  addBordersToAllFilledCells,
  addBlankRowIfTableEmpty,
} = require('../../../../utils/excelUtils');
const models = require('../../../../models');

const generateQualificationsTab = async (workbook, establishmentId) => {
  const rawWorkerQualifications = await models.establishment.getWorkerQualifications(establishmentId, true);
  const workerQualifications = convertWorkerQualifications(rawWorkerQualifications);
  const qualificationsTab = workbook.addWorksheet('Qualifications', { views: [{ showGridLines: false }] });

  addContentToQualificationsTab(qualificationsTab, workerQualifications);
};

const addContentToQualificationsTab = (qualificationsTab, workerQualifications) => {
  addHeading(qualificationsTab, 'B2', 'E2', 'Qualifications');
  addLine(qualificationsTab, 'A4', 'G4');
  alignColumnToLeft(qualificationsTab, 2);

  const qualificationsTable = createQualificationsTable(qualificationsTab);
  addRowsToQualificationsTable(qualificationsTable, workerQualifications);

  fitColumnsToSize(qualificationsTab, 2, 5.5);
  addBordersToAllFilledCells(qualificationsTab, 5);
};

const createQualificationsTable = (tab) => {
  setTableHeadingsStyle(tab, 6, backgroundColours.blue, textColours.white, ['B', 'C', 'D', 'E', 'F', 'G']);

  return tab.addTable({
    name: 'workerQualificationsTable',
    ref: 'B6',
    columns: [
      { name: 'Worker ID', filterButton: true },
      { name: 'Job role', filterButton: true },
      { name: 'Qualification type', filterButton: true },
      { name: 'Qualification name', filterButton: true },
      { name: 'Qualification level', filterButton: true },
      { name: 'Year achieved', filterButton: true },
    ],
    rows: [],
  });
};

const addRowsToQualificationsTable = (workerQualificationsTable, workers) => {
  for (let worker of workers) {
    workerQualificationsTable.addRow([
      worker.workerName,
      worker.jobRole,
      worker.qualificationType,
      worker.qualificationName,
      worker.qualificationLevel ? `Level ${worker.qualificationLevel}` : '',
      worker.yearAchieved ? worker.yearAchieved : '',
    ]);
  }

  addBlankRowIfTableEmpty(workerQualificationsTable, 6);

  workerQualificationsTable.commit();
};

module.exports.generateQualificationsTab = generateQualificationsTab;
module.exports.addContentToQualificationsTab = addContentToQualificationsTab;
