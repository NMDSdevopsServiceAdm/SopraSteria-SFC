const { Op } = require('sequelize');

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
  const parentAndSubsidiaries = await models.establishment.searchEstablishments({
    [Op.or]: [
      {
        id: establishmentId,
      },
      {
        parentId: establishmentId,
        dataOwner: 'Parent',
      },
      {
        parentId: establishmentId,
        dataOwner: 'Workplace',
        dataPermissions: 'Workplace and Staff'
      },
    ],
  });

  const object = parentAndSubsidiaries.map((workplace) => {
    return workplace.id;
  });

  const rawEstablishmentTrainingBreakdowns = await models.establishment.workersAndTraining(
    object,
    true,
  );

  const establishmentRecordTotals = [];
  rawEstablishmentTrainingBreakdowns.forEach((establishment) => {
    const trainingBreakdowns = convertWorkerTrainingBreakdowns(establishment.workers);

    establishmentRecordTotals.push({
      establishmentId: establishment.id,
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
  addRowsToTable(establishmentRecordTotals, summaryTable)

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
    rows: [
      ['Total', 1, 2, 3, 1, 2, 3, 1, 2, 3, 4],
    ],
  });
}

const addRowsToTable = (establishments, summaryTable) => {
  establishments.forEach((establishment) => {
    summaryTable.addRow([
      establishment.establishmentId,
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

  firstColumn.width = 24;
  for (let i = 2; i < 13; i++) {
    tab.getColumn(i).width = 15;
  }
};


module.exports.generateSummaryTab = generateSummaryTab;
module.exports.addContentToSummaryTab = addContentToSummaryTab;
