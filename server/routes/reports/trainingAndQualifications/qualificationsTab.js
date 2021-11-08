const { convertQualificationsForEstablishments } = require('../../../utils/trainingAndQualificationsUtils');
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
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateQualificationsTab = async (workbook, establishmentId, isParent = false) => {
  const rawEstablishments = await models.establishment.getWorkerQualifications(establishmentId, isParent);
  const establishments = convertQualificationsForEstablishments(rawEstablishments);

  const qualificationsTab = workbook.addWorksheet('Qualifications', { views: [{ showGridLines: false }] });

  addContentToQualificationsTab(qualificationsTab, establishments, isParent);
};

const addContentToQualificationsTab = (qualificationsTab, establishments, isParent) => {
  addHeading(qualificationsTab, 'B2', 'E2', 'Qualifications');
  addLine(qualificationsTab, 'A4', isParent ? 'H4' : 'G4');
  alignColumnToLeft(qualificationsTab, isParent ? 3 : 2);

  const qualificationsTable = createQualificationsTable(qualificationsTab, isParent);
  addRowsToQualificationsTable(qualificationsTable, establishments, isParent);

  fitColumnsToSize(qualificationsTab, 2, 5.5);
  addBordersToAllFilledCells(qualificationsTab, 5);
};

const createQualificationsTable = (tab, isParent) => {
  setStylesForQualificationsTableHeadings(tab, isParent);

  const columns = [
    { name: 'Worker ID', filterButton: true },
    { name: 'Job role', filterButton: true },
    { name: 'Qualification type', filterButton: true },
    { name: 'Qualification name', filterButton: true },
    { name: 'Qualification level', filterButton: true },
    { name: 'Year achieved', filterButton: true },
  ];

  if (isParent) {
    columns.unshift({ name: 'Workplace', filterButton: true });
  }

  return tab.addTable({
    name: 'workerQualificationsTable',
    ref: 'B6',
    columns,
    rows: [],
  });
};

const addRowsToQualificationsTable = (workerQualificationsTable, establishments, isParent) => {
  for (let establishment of establishments) {
    addQualificationRowsForEstablishment(workerQualificationsTable, establishment, isParent);
  }

  addBlankRowIfTableEmpty(workerQualificationsTable, isParent ? 7 : 6);
  workerQualificationsTable.commit();
};

const addQualificationRowsForEstablishment = (workerQualificationsTable, establishment, isParent) => {
  for (let qualification of establishment.qualifications) {
    const row = [
      qualification.workerName,
      qualification.jobRole,
      qualification.qualificationType,
      qualification.qualificationName,
      qualification.qualificationLevel ? `Level ${qualification.qualificationLevel}` : '',
      qualification.yearAchieved ? qualification.yearAchieved : '',
    ];

    if (isParent) {
      row.unshift(establishment.name);
    }

    workerQualificationsTable.addRow(row);
  }
};

const setStylesForQualificationsTableHeadings = (tab, isParent) => {
  const headingColumns = ['B', 'C', 'D', 'E', 'F', 'G'];
  if (isParent) headingColumns.push('H');

  setTableHeadingsStyle(tab, 6, backgroundColours.blue, textColours.white, headingColumns);
};

module.exports.generateQualificationsTab = generateQualificationsTab;
module.exports.addContentToQualificationsTab = addContentToQualificationsTab;
