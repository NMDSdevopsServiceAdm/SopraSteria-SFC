const { convertWorkerTrainingBreakdowns, getTrainingTotals } = require('../../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  backgroundColours,
  textColours,
  setTableHeadingsStyle,
  alignColumnToLeft,
  addBordersToAllFilledCells,
} = require('../../../../utils/excelUtils');
const models = require('../../../../models');

const generateSummaryTab = async (workbook, establishmentId) => {
  const rawEstablishmentTrainingBreakdowns = await models.establishment.workersAndTraining(
    [establishmentId],
    true,
  );
  const establishmentTrainingBreakdowns = [];
  const establishmentRecordTotals = [];

  rawEstablishmentTrainingBreakdowns.forEach((establishment) => {
    establishmentTrainingBreakdowns.push({
      establishmentId: establishment.id,
      workers: convertWorkerTrainingBreakdowns(establishment.workers)
    });
  });

  establishmentTrainingBreakdowns.forEach((establishmentTrainingBreakdown) => {
    establishmentRecordTotals.push({
      establishmentId: establishmentTrainingBreakdown.establishmentId,
      trainingTotals: getTrainingTotals(establishmentTrainingBreakdown.workers),
    });
  });

  console.log(establishmentTrainingBreakdowns)
  console.log(establishmentRecordTotals)

  const summaryTab = workbook.addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });

  addContentToSummaryTab(summaryTab, establishmentTrainingBreakdowns, establishmentRecordTotals);
};

const addContentToSummaryTab = (summaryTab, establishmentTrainingBreakdowns, establishmentRecordTotals) => {
  addHeading(summaryTab, 'B2', 'E2', 'Training (summary)');
  addLine(summaryTab, 'A4', 'L4');
  alignColumnToLeft(summaryTab, 2);

  summaryTab.mergeCells('B6:B7')
  setTableHeadingsStyle(summaryTab, 6, backgroundColours.blue, textColours.white, ['B'])
  setTableHeadingsStyle(summaryTab, 7, backgroundColours.blue, textColours.white, ['B'])

  addHeading(summaryTab, 'C6', 'E6', 'Up to date');
  setTableHeadingsStyle(summaryTab, 6, backgroundColours.green, textColours.green, ['C', 'D', 'E']);
  setTableHeadingsStyle(summaryTab, 7, backgroundColours.green, textColours.green, ['C', 'D', 'E']);

  addHeading(summaryTab, 'F6', 'H6', 'Expiring soon');
  setTableHeadingsStyle(summaryTab, 6, backgroundColours.yellow, textColours.yellow, ['F', 'G', 'H']);
  setTableHeadingsStyle(summaryTab, 7, backgroundColours.yellow, textColours.yellow, ['F', 'G', 'H']);

  addHeading(summaryTab, 'I6', 'K6', 'Expired');
  setTableHeadingsStyle(summaryTab, 6, backgroundColours.red, textColours.red, ['I', 'J', 'K']);
  setTableHeadingsStyle(summaryTab, 7, backgroundColours.red, textColours.red, ['I', 'J', 'K']);

  addHeading(summaryTab, 'L6', 'L6', 'Missing');
  setTableHeadingsStyle(summaryTab, 6, backgroundColours.red, textColours.red, ['L'])
  setTableHeadingsStyle(summaryTab, 7, backgroundColours.red, textColours.red, ['L']);

  summaryTab.addTable({
    name: 'summaryTable',
    ref: 'B' + 7,
    columns: [
      { name: 'Workplace', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
      { name: 'Total', filterButton: false },
      { name: 'Mandatory', filterButton: false },
      { name: 'Non-mandatory', filterButton: false },
      { name: 'Total', filterButton: false },
    ],
    rows: [
      ['Total', 1, 2, 3, 1, 2, 3, 1, 2, 3, 4],
    ],
  });

  addBordersToAllFilledCells(summaryTab, 5);
  setColumnWidths(summaryTab);
};

const setColumnWidths = (tab) => {
  const firstColumn = tab.getColumn(2);

  firstColumn.width = 24;
  for (let i = 2; i < 13; i++) {
    tab.getColumn(i).width = 15;
  }
};


module.exports.generateSummaryTab = generateSummaryTab;
module.exports.addContentToSummaryTab = addContentToSummaryTab;
