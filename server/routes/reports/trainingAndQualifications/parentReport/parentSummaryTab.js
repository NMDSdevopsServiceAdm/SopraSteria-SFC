const { convertWorkerTrainingBreakdowns, getTrainingTotals, getTotalsForAllWorkplaces } = require('../../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  backgroundColours,
  textColours,
  setTableHeadingsStyle,
  alignColumnToLeft,
  addBordersToAllFilledCells,
  makeRowBold,
} = require('../../../../utils/excelUtils');
const models = require('../../../../models');

const generateSummaryTab = async (workbook, establishmentId) => {
  const rawEstablishmentTrainingBreakdowns = await models.establishment.workersAndTraining(
    establishmentId,
    true,
    true,
  );

  const establishmentRecordTotals = [];
  rawEstablishmentTrainingBreakdowns.forEach((establishment) => {
    const trainingBreakdowns = convertWorkerTrainingBreakdowns(establishment.workers);

    establishmentRecordTotals.push({
      establishmentName: establishment.get('NameValue'),
      totals: getTrainingTotals(trainingBreakdowns),
    });
  });

  const summaryTab = workbook.addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });
  addContentToSummaryTab(summaryTab, establishmentRecordTotals);
};

const setHeadingWithStyling = (tab, cols, colour, text) => {
  addHeading(tab, cols[0] + '6', cols[cols.length - 1] + '6', text);
  setTableHeadingsStyle(tab, 6, backgroundColours[colour], textColours[colour], cols);
  setTableHeadingsStyle(tab, 7, backgroundColours[colour], textColours[colour], cols);
}

const addContentToSummaryTab = (summaryTab, establishmentRecordTotals) => {
  addHeading(summaryTab, 'B2', 'E2', 'Training (summary)');
  addLine(summaryTab, 'A4', 'L4');

  summaryTab.mergeCells('B6:B7')
  setTableHeadingsStyle(summaryTab, 6, backgroundColours.blue, textColours.white, ['B'])
  setTableHeadingsStyle(summaryTab, 7, backgroundColours.blue, textColours.white, ['B'])

  setHeadingWithStyling(summaryTab, ['C', 'D', 'E'], 'green', 'Up to date');
  setHeadingWithStyling(summaryTab, ['F', 'G', 'H'], 'yellow', 'Expiring soon');
  setHeadingWithStyling(summaryTab, ['I', 'J', 'K'], 'red', 'Expired');
  setHeadingWithStyling(summaryTab, ['L'], 'red', 'Missing');

  const summaryTable = createSummaryTable(summaryTab);
  addTotalsToSummaryTable(establishmentRecordTotals, summaryTable)
  addRowsToTable(establishmentRecordTotals, summaryTable)

  alignColumnToLeft(summaryTab, 2);
  makeRowBold(summaryTab, 8);
  addBordersToAllFilledCells(summaryTab, 5);
  setColumnWidths(summaryTab);
};

const createSummaryTable = (summaryTab) => {
  return summaryTab.addTable({
    name: 'summaryTable',
    ref: 'B7',
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
    rows: [],
  });
}

const addTotalsToSummaryTable = (establishments, summaryTable) => {
  const totals = getTotalsForAllWorkplaces(establishments).totals;
  summaryTable.addRow([
    'Total',
    totals.upToDate.total,
    totals.upToDate.mandatory,
    totals.upToDate.nonMandatory,
    totals.expiringSoon.total,
    totals.expiringSoon.mandatory,
    totals.expiringSoon.nonMandatory,
    totals.expired.total,
    totals.expired.mandatory,
    totals.expired.nonMandatory,
    totals.missing,
  ]);

  summaryTable.commit();
}

const addRowsToTable = (establishments, summaryTable) => {
  establishments.forEach((establishment) => {
    summaryTable.addRow([
      establishment.establishmentName,
      establishment.totals.upToDate.total,
      establishment.totals.upToDate.mandatory,
      establishment.totals.upToDate.nonMandatory,
      establishment.totals.expiringSoon.total,
      establishment.totals.expiringSoon.mandatory,
      establishment.totals.expiringSoon.nonMandatory,
      establishment.totals.expired.total,
      establishment.totals.expired.mandatory,
      establishment.totals.expired.nonMandatory,
      establishment.totals.missing,
    ]);
  })

  summaryTable.commit();
};

const setColumnWidths = (tab) => {
  const startingColumn = 2;
  const firstColumn = tab.getColumn(startingColumn);
  const totalColumns = tab.getRow(8).actualCellCount + startingColumn;

  firstColumn.width = 30;
  for (var i = startingColumn + 1; i < totalColumns; i++) {
    tab.getColumn(i).width = 15;
  }
};

module.exports.generateSummaryTab = generateSummaryTab;
module.exports.addContentToSummaryTab = addContentToSummaryTab;
