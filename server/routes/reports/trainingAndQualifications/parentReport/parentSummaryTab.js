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

  const establishmentRecordTotals = rawEstablishmentTrainingBreakdowns.map((establishment) => {
    const trainingBreakdowns = convertWorkerTrainingBreakdowns(establishment.workers);
    return {
      establishmentName: establishment.get('NameValue'),
      totals: getTrainingTotals(trainingBreakdowns),
    };
  });

  const summaryTab = workbook.addWorksheet('Training (summary)', { views: [{ showGridLines: false }] });
  addContentToSummaryTab(summaryTab, establishmentRecordTotals);
};

const addContentToSummaryTab = (summaryTab, establishmentRecordTotals) => {
  addHeading(summaryTab, 'B2', 'E2', 'Training (summary)');
  addLine(summaryTab, 'A4', 'L4');

  addTrainingStatusHeadings(summaryTab);
  addMandatoryBreakdownHeadings(summaryTab);
  addTotalsRow(establishmentRecordTotals, summaryTab);
  addTrainingSummaryRows(establishmentRecordTotals, summaryTab);

  addHeading(summaryTab, 'B6', 'B7', 'Workplace');
  setTableHeadingsStyle(summaryTab, 6, backgroundColours.blue, textColours.white, ['B']);

  setHeadingsStyling(summaryTab);

  alignColumnToLeft(summaryTab, 2);
  makeRowBold(summaryTab, 8);
  addBordersToAllFilledCells(summaryTab, 5);
  setColumnWidths(summaryTab);
};

const addTrainingStatusHeadings = (summaryTab) => {
  addHeading(summaryTab, 'C6', 'E6', 'Up to date');
  addHeading(summaryTab, 'F6', 'H6', 'Expiring soon');
  addHeading(summaryTab, 'I6', 'K6', 'Expired');
  addHeading(summaryTab, 'L6', 'L6', 'Missing');
};

const addMandatoryBreakdownHeadings = (summaryTab) => {
  summaryTab.addRow([
    null,
    'Workplace',
    'Total',
    'Mandatory',
    'Non-mandatory',
    'Total',
    'Mandatory',
    'Non-mandatory',
    'Total', 'Mandatory',
    'Non-mandatory',
    'Total'
  ]);
};

const addTotalsRow = (establishments, summaryTab) => {
  const totals = getTotalsForAllWorkplaces(establishments).totals;
  summaryTab.addRow([
    null,
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
};

const addTrainingSummaryRows = (establishments, summaryTab) => {
  establishments.forEach((establishment) => {
    summaryTab.addRow([
      null,
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
  });
};

const setColumnWidths = (tab) => {
  const startingColumn = 2;
  const firstColumn = tab.getColumn(startingColumn);
  const totalColumns = tab.getRow(8).actualCellCount + startingColumn;

  firstColumn.width = 30;
  for (var i = startingColumn + 1; i < totalColumns; i++) {
    tab.getColumn(i).width = 15;
  };
};

const setHeadingsStyling = (summaryTab) => {
  setStyling(summaryTab, ['C', 'D', 'E'], 'green');
  setStyling(summaryTab, ['F', 'G', 'H'], 'yellow');
  setStyling(summaryTab, ['I', 'J', 'K'], 'red');
  setStyling(summaryTab, ['L'], 'red');
};

const setStyling = (tab, cols, colour) => {
  setTableHeadingsStyle(tab, 6, backgroundColours[colour], textColours[colour], cols);
  setTableHeadingsStyle(tab, 7, backgroundColours[colour], textColours[colour], cols);
};

module.exports.generateSummaryTab = generateSummaryTab;
module.exports.addContentToSummaryTab = addContentToSummaryTab;
