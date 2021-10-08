const {
  addHeading,
  addLine,
  backgroundColours,
  textColours,
  setTableHeadingsStyle,
  addBordersToAllFilledCells,
} = require('../../../utils/excelUtils');

const generateTrainingTab = async (workbook) => {
  const trainingTab = workbook.addWorksheet('Training', { views: [{ showGridLines: false }] });

  addContentToTrainingTab(trainingTab);
};

const addContentToTrainingTab = (trainingTab) => {
  addHeading(trainingTab, 'B2', 'E2', 'Training');
  addLine(trainingTab, 'A4', 'K4');

  createTrainingTable(trainingTab);
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

module.exports.generateTrainingTab = generateTrainingTab;
module.exports.addContentToTrainingTab = addContentToTrainingTab;
