const { convertTrainingForEstablishments } = require('../../../utils/trainingAndQualificationsUtils');
const {
  addText,
  setColourForRange,
  newBackgroundColours,
  newTextColours,
  conditionalColoursForTrainingExpiry,
  setColourForCell,
  setBasicTableStyle,
  tableHeaderCellStyle,
  borderStyles,
  applyStyleToRange,
  autoFitColumnWidthByTextLength,
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const colCache = require('exceljs/lib/utils/col-cache');
const lodash = require('lodash');

const GroupHeaderRowNumber = 3;
const HeaderRowNumber = 4;

const orderOfColumnNameAndDataFields = [
  { columnName: 'Workplace', field: 'workplaceName' },
  { columnName: 'Name or ID number', field: 'name' },
  { columnName: 'Total', field: 'trainingCount' },
  { columnName: 'Expired', field: 'expiredMandatoryTrainingCount', isMandatoryTrainingField: true },
  {
    columnName: 'Expiring soon',
    field: 'expiringMandatoryTrainingCount',
    isMandatoryTrainingField: true,
  },
  { columnName: 'Up-to-date', field: 'upToDateMandatoryTrainingCount', isMandatoryTrainingField: true },
  { columnName: 'Total', field: 'mandatoryTrainingCount', isMandatoryTrainingField: true },
  { columnName: 'Missing', field: 'missingMandatoryTrainingCount', isMandatoryTrainingField: true },
  { columnName: 'Expired', field: 'expiredNonMandatoryTrainingCount' },
  {
    columnName: 'Expiring soon',
    field: 'expiringNonMandatoryTrainingCount',
  },
  {
    columnName: 'Up-to-date',
    field: 'upToDateNonMandatoryTrainingCount',
  },
  { columnName: 'Total', field: 'nonMandatoryTrainingCount' },
];

const generateTrainingByCategoryTab = async (workbook, establishmentId, isParent = false) => {
  const trainingByCategoryTab = workbook.addWorksheet('Training by category', { views: [{ showGridLines: false }] });

  addTitle(trainingByCategoryTab);

  addGroupHeaderRow(trainingByCategoryTab, isParent);

  // addWorkerTable(trainingByStaffTab, workerTrainingBreakdowns, isParent);

  // setHeightsAndWidths(trainingByStaffTab);

  // addFootNote(trainingByStaffTab);

  // setFreezePane(trainingByStaffTab);
};

const addTitle = (trainingByCategoryTab) => {
  addText(trainingByCategoryTab, 'B1:Z1', 'Training records by category', { size: 24, bold: true });
  trainingByCategoryTab.getCell('B1').alignment = { vertical: 'middle' };
  setColourForRange(trainingByCategoryTab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });
};

const addGroupHeaderRow = (tab, isParent) => {
  const rangeForEachGroup = isParent ? ['B3:H3'] : ['B3:H3'];

  addText(tab, rangeForEachGroup[0], 'Training', { bold: true });
};

module.exports = { generateTrainingByCategoryTab };
