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
  const establishments = rawWorkerQualifications.map((establishment) => {
    return {
      name: establishment.NameValue,
      qualifications: convertWorkerQualifications(establishment),
    };
  });

  const qualificationsTab = workbook.addWorksheet('Qualifications', { views: [{ showGridLines: false }] });

  addContentToQualificationsTab(qualificationsTab, establishments);
};

const addContentToQualificationsTab = (qualificationsTab, establishments) => {
  addHeading(qualificationsTab, 'B2', 'E2', 'Qualifications');
  addLine(qualificationsTab, 'A4', 'H4');
  alignColumnToLeft(qualificationsTab, 3);

  const qualificationsTable = createQualificationsTable(qualificationsTab);
  addRowsToQualificationsTable(qualificationsTable, establishments);

  fitColumnsToSize(qualificationsTab, 2, 5.5);
  addBordersToAllFilledCells(qualificationsTab, 5);
};

const createQualificationsTable = (tab) => {
  setTableHeadingsStyle(tab, 6, backgroundColours.blue, textColours.white, ['B', 'C', 'D', 'E', 'F', 'G', 'H']);

  return tab.addTable({
    name: 'workerQualificationsTable',
    ref: 'B6',
    columns: [
      { name: 'Workplace', filterButton: true },
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

const addRowsToQualificationsTable = (workerQualificationsTable, establishments) => {
  for (let establishment of establishments) {
    for (let worker of establishment.qualifications) {
      workerQualificationsTable.addRow([
        establishment.name,
        worker.workerName,
        worker.jobRole,
        worker.qualificationType,
        worker.qualificationName,
        worker.qualificationLevel ? `Level ${worker.qualificationLevel}` : '',
        worker.yearAchieved ? worker.yearAchieved : '',
      ]);
    }
  }

  addBlankRowIfTableEmpty(workerQualificationsTable, 7);

  workerQualificationsTable.commit();
};

module.exports.generateQualificationsTab = generateQualificationsTab;
module.exports.addContentToQualificationsTab = addContentToQualificationsTab;
