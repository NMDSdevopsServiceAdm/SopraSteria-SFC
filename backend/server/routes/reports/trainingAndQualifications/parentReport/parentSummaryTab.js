const lodash = require('lodash');
const {
  addText,
  setColourForRange,
  newBackgroundColours,
  setBasicTableStyle,
  applyStyleToRange,
  tableHeaderCellStyle,
  colourSchemeForParentSummary,
  getCellStyleForParentSummary,
} = require('../../../../utils/excelUtils');
const {
  WorkerCareCertificate,
  WorkerLevel2CareCertificate,
  WorkerSocialCareQualificationLevel,
} = require('../../../../../reference/databaseEnumTypes');

const colCache = require('exceljs/lib/utils/col-cache');

const GroupHeaderRowNumber = 5;
const HeaderRowNumber = 6;
const GrandTotalRowNumber = 7;

const generateParentSummaryTab = async (workbook, establishment, summaryTabData) => {
  const summaryTab = workbook.addWorksheet('Summary', { views: [{ showGridLines: false }] });
  const establishmentName = establishment.NameValue;

  addTitle(summaryTab, establishmentName);
  addBannerImage(workbook, summaryTab);

  addSummaryTable(summaryTab, summaryTabData);

  setHeightAndWidths(summaryTab);
};

const addTitle = (tab, establishmentName) => {
  addText(tab, 'B2:I2', establishmentName, { size: 26, bold: true });
  addText(tab, 'B3:C3', 'Summary', { size: 24, bold: true });

  setColourForRange(tab, 'A2:AP3', { backgroundColour: newBackgroundColours.lightGrey });
};

const addBannerImage = (workbook, tab) => {
  tab.addImage(0, { tl: { col: 1, row: 0 }, ext: { width: 431, height: 62.4 } });
};

const setHeightAndWidths = (tab) => {
  const columnWidths = [6.83, 26.83, ...Array(24).fill(16.83)];
  const rowHeights = [45, 45, 45, 36, 36, 36];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });
};

const addSummaryTable = (tab, summaryTabData) => {
  const defaultValue = 0;
  addText(tab, 'B4', 'All staff', { size: 18, bold: true });

  subheadings.forEach(({ text, range }) => {
    addText(tab, range, text, { size: 12, bold: true });
  });

  const allColumnLabels = columnsToDisplay.map((column) => column.columnName);
  tab.addRow(['', ...allColumnLabels]);

  tab.addRow(['', 'All workplaces', '']);

  summaryTabData.forEach((workplace) => {
    const rowData = columnsToDisplay.map((column) => {
      return lodash.get(workplace, column.field, defaultValue);
    });
    tab.addRow(['', ...rowData]);
  });

  const tableHeaderRange = `B${GroupHeaderRowNumber}:Z${GrandTotalRowNumber}`;
  const tableRange = `B${GrandTotalRowNumber}:Z${tab.lastRow.number}`;

  setBasicTableStyle(tab, tableRange, { hasTotalRow: false, alignHorizontalCenter: true, bold: true });

  applyStyleToRange(tab, tableHeaderRange, tableHeaderCellStyle);

  setColourStyleForTable(tab, tableRange);
};

const setColourStyleForTable = (tab, tableRange) => {
  const { bottom } = colCache.decode(tableRange);

  columnsToDisplay.forEach((column, index) => {
    const columnNumber = index + 2;
    const range = colCache.encode(GrandTotalRowNumber + 1, columnNumber, bottom, columnNumber);
    const cellStyle = getCellStyleForParentSummary(column.columnName);
    if (cellStyle) {
      applyStyleToRange(tab, range, cellStyle);
    }
  });
};

const subheadings = [
  { text: 'All training records (could include staff flagged as long-term absent)', range: 'C5:F5' },
  { text: 'Mandatory training records', range: 'G5:K5' },
  { text: 'Non-mandatory training records', range: 'L5:O5' },
  { text: 'Care Certificates', range: 'P5:R5' },
  { text: 'L2 Adult Social Care Certificates', range: 'S5:U5' },
  { text: 'Social care qualification levels', range: 'V5:Z5' },
];

const columnsToDisplay = [
  { columnName: 'Workplace', field: 'workplaceName' },

  { columnName: 'Expired', field: ['trainingBreakdownTotals', 'expiredTrainingCount'] },
  { columnName: 'Expiring soon', field: ['trainingBreakdownTotals', 'expiringTrainingCount'] },
  { columnName: 'Up-to-date', field: ['trainingBreakdownTotals', 'upToDateTrainingCount'] },
  { columnName: 'Total', field: ['trainingBreakdownTotals', 'trainingCount'] },

  { columnName: 'Expired', field: ['trainingBreakdownTotals', 'expiredMandatoryTrainingCount'] },
  { columnName: 'Expiring soon', field: ['trainingBreakdownTotals', 'expiringMandatoryTrainingCount'] },
  { columnName: 'Up-to-date', field: ['trainingBreakdownTotals', 'upToDateMandatoryTrainingCount'] },
  { columnName: 'Total', field: ['trainingBreakdownTotals', 'mandatoryTrainingCount'] },
  { columnName: 'Missing records', field: ['trainingBreakdownTotals', 'missingMandatoryTrainingCount'] },

  { columnName: 'Expired', field: ['trainingBreakdownTotals', 'expiredNonMandatoryTrainingCount'] },
  { columnName: 'Expiring soon', field: ['trainingBreakdownTotals', 'expiringNonMandatoryTrainingCount'] },
  { columnName: 'Up-to-date', field: ['trainingBreakdownTotals', 'upToDateNonMandatoryTrainingCount'] },
  { columnName: 'Total', field: ['trainingBreakdownTotals', 'nonMandatoryTrainingCount'] },

  {
    columnName: 'Completed',
    field: ['careCertAndQualificationLevels', 'careCertificate', WorkerCareCertificate.YesCompleted],
  },
  {
    columnName: 'Started',
    field: ['careCertAndQualificationLevels', 'careCertificate', WorkerCareCertificate.YesInProgress],
  },
  {
    columnName: 'Not started',
    field: ['careCertAndQualificationLevels', 'careCertificate', WorkerCareCertificate.No],
  },

  {
    columnName: 'Completed',
    field: ['careCertAndQualificationLevels', 'level2CareCertificate', WorkerLevel2CareCertificate.YesCompleted],
  },
  {
    columnName: 'Started',
    field: ['careCertAndQualificationLevels', 'level2CareCertificate', WorkerLevel2CareCertificate.YesStarted],
  },
  {
    columnName: 'Not started',
    field: ['careCertAndQualificationLevels', 'level2CareCertificate', WorkerLevel2CareCertificate.No],
  },

  {
    columnName: 'Level 2 or higher',
    field: [
      'careCertAndQualificationLevels',
      'socialCareQualificationLevel',
      WorkerSocialCareQualificationLevel.Level2OrAbove,
    ],
  },
  {
    columnName: 'Level 2',
    field: [
      'careCertAndQualificationLevels',
      'socialCareQualificationLevel',
      WorkerSocialCareQualificationLevel.Level2,
    ],
  },
  {
    columnName: 'Level 3',
    field: [
      'careCertAndQualificationLevels',
      'socialCareQualificationLevel',
      WorkerSocialCareQualificationLevel.Level3,
    ],
  },
  {
    columnName: 'Level 4',
    field: [
      'careCertAndQualificationLevels',
      'socialCareQualificationLevel',
      WorkerSocialCareQualificationLevel.Level4,
    ],
  },
  {
    columnName: 'Level 5 or above',
    field: [
      'careCertAndQualificationLevels',
      'socialCareQualificationLevel',
      WorkerSocialCareQualificationLevel.Level5OrAbove,
    ],
  },
];

module.exports = { generateParentSummaryTab };
