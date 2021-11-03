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

let upToDateTotal = 0;
let upToDateTotalMandatory = 0;
let upToDateTotalNonMandatory = 0;
let expiringSoonTotal = 0;
let expiringSoonTotalMandatory = 0;
let expiringSoonTotalNonMandatory = 0;
let expiredTotal = 0;
let expiredTotalMandatory = 0;
let expiredTotalNonMandatory = 0;
let totalMissing = 0;

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

const addContentToSummaryTab = (summaryTab, establishmentRecordTotals) => {
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

  const summaryTable = createSummaryTable(summaryTab);
  addTotalsToSummaryTable(establishmentRecordTotals, summaryTable)
  addRowsToTable(establishmentRecordTotals, summaryTable)

  addStylingToTotalsRow(summaryTab);
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
  getTotalsForAllWorkplaces(establishments);
  summaryTable.addRow([
    'Total',
    upToDateTotal,
    upToDateTotalMandatory,
    upToDateTotalNonMandatory,
    expiringSoonTotal,
    expiringSoonTotalMandatory,
    expiringSoonTotalNonMandatory,
    expiredTotal,
    expiredTotalMandatory,
    expiredTotalNonMandatory,
    totalMissing,
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
  const firstColumn = tab.getColumn(2);

  firstColumn.width = 30;
  for (let i = 3; i < 13; i++) {
    tab.getColumn(i).width = 15;
  }
};

const getTotalsForAllWorkplaces = (establishments) => {
  establishments.forEach((establishment) => {
    upToDateTotal += establishment.totals.upToDate.total;
    upToDateTotalMandatory += establishment.totals.upToDate.mandatory;
    upToDateTotalNonMandatory += establishment.totals.upToDate.nonMandatory;
    expiringSoonTotal += establishment.totals.expiringSoon.total;
    expiringSoonTotalMandatory += establishment.totals.expiringSoon.mandatory;
    expiringSoonTotalNonMandatory += establishment.totals.expiringSoon.nonMandatory;
    expiredTotal += establishment.totals.expired.total;
    expiredTotalMandatory += establishment.totals.expired.mandatory;
    expiredTotalNonMandatory += establishment.totals.expired.nonMandatory;
    totalMissing += establishment.totals.missing;
  });
}

addStylingToTotalsRow = (tab) => {
  tab.getRow(8).font = { bold: true };
}


module.exports.generateSummaryTab = generateSummaryTab;
module.exports.addContentToSummaryTab = addContentToSummaryTab;
