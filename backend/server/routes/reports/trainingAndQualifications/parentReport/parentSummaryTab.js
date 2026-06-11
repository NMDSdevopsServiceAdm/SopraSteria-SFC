const lodash = require('lodash');
const {
  addText,
  setColourForRange,
  newBackgroundColours,
  setBasicTableStyle,
  applyStyleToRange,
  tableHeaderCellStyle,
  getCellStyleForParentSummary,
  borderStyles,
  alignments,
  forEachCellInRange,
  MissingRecordsExplanationText,
  autoAdjustWrapTextAndRowHeight,
} = require('../../../../utils/excelUtils');
const {
  WorkerCareCertificate,
  WorkerLevel2CareCertificate,
  WorkerSocialCareQualificationLevel,
  Level2OrAbove,
  Level5OrAbove,
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

  autoAdjustWrapTextForWorkplaceColumn(summaryTab);

  addMissingRecordFootNote(summaryTab);
};

const addTitle = (tab, establishmentName) => {
  addText(tab, 'B2:I2', establishmentName, { size: 26, bold: true }, { alignment: alignments.middleLeft });
  addText(tab, 'B3:C3', 'Summary', { size: 24, bold: true }, { alignment: alignments.middleLeft });

  setColourForRange(tab, 'A2:AP3', { backgroundColour: newBackgroundColours.lightGrey });
};

const addBannerImage = (workbook, tab) => {
  tab.addImage(0, { tl: { col: 1, row: 0 }, ext: { width: 431, height: 62.4 } });
};

const setHeightAndWidths = (tab) => {
  const columnWidths = [8, 26.83, ...Array(24).fill(16.83)];
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
  addText(tab, 'B4', 'All staff', { size: 18, bold: true }, { alignment: alignments.middleLeft });

  const { total, workplacesData } = summaryTabData;

  subheadings.forEach(({ text, range }) => {
    addText(tab, range, text, { size: 12, bold: true });
  });

  const allColumnLabels = columnsToDisplay.map((column) => column.columnName);
  tab.addRow(['', ...allColumnLabels]);

  if (workplacesData?.length) {
    addTotalRowToTable(tab, total, defaultValue);

    workplacesData.forEach((workplace) => {
      const rowData = columnsToDisplay.map((column) => {
        return lodash.get(workplace, column.field, defaultValue) ?? '-';
      });
      tab.addRow(['', ...rowData]);
    });
  } else {
    addEmptyRowToTable(tab);
  }

  const tableRange = `B${GrandTotalRowNumber}:Z${tab.lastRow.number}`;

  setBasicTableStyle(tab, tableRange, { hasTotalRow: false, alignHorizontalCenter: true, bold: true });

  setColourStyleForTableHeader(tab);

  showSocialCareQualsLevelAsPercentageFormat(tab, tableRange);

  setColourStyleForTable(tab, tableRange);
  addThickBordersToTable(tab, tableRange);
};

const addTotalRowToTable = (tab, total, defaultValue) => {
  const numberColumns = columnsToDisplay.slice(1);
  const rowData = numberColumns.map((column) => {
    return lodash.get(total, column.field, defaultValue);
  });

  tab.addRow(['', 'All workplaces', ...rowData]);
};

const addEmptyRowToTable = (tab) => {
  tab.addRow(Array(columnsToDisplay.length + 1).fill(''));
};

const setColourStyleForTableHeader = (tab) => {
  const tableHeaderRange = `B${GroupHeaderRowNumber}:Z${GrandTotalRowNumber}`;

  applyStyleToRange(tab, tableHeaderRange, tableHeaderCellStyle);

  const areaToAlignAtCenter = `C${HeaderRowNumber}:Z${GrandTotalRowNumber}`;
  applyStyleToRange(tab, areaToAlignAtCenter, { alignment: alignments.middleCenter });
};

const showSocialCareQualsLevelAsPercentageFormat = (tab, tableRange) => {
  const subHeadingForSocialCareQualsLevel = subheadings.at(-1);
  const { left, right } = colCache.decode(subHeadingForSocialCareQualsLevel.range);
  const { bottom } = colCache.decode(tableRange);
  const top = GrandTotalRowNumber;

  const areaToShowAsPercentage = colCache.encode(top, left, bottom, right);

  forEachCellInRange(tab, areaToShowAsPercentage, (cell) => {
    cell.numFmt = '0%';
  });
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

const addThickBordersToTable = (tab, tableRange) => {
  const groupsToAddThickBorder = subheadings.slice(0, -1);
  const { bottom } = colCache.decode(tableRange);

  groupsToAddThickBorder.forEach((subheading) => {
    const { right } = colCache.decode(subheading.range);
    const cellsToAddThickBorder = colCache.encode(GroupHeaderRowNumber, right, bottom, right);
    applyStyleToRange(tab, cellsToAddThickBorder, { border: borderStyles.thickBlackBorderRight });
  });
};

const autoAdjustWrapTextForWorkplaceColumn = (tab) => {
  const top = GrandTotalRowNumber + 1;
  const bottom = tab.lastRow.number;

  const autoAdjustRange = `B${top}:B${bottom}`;

  forEachCellInRange(tab, autoAdjustRange, (cell) => {
    autoAdjustWrapTextAndRowHeight(tab, cell);
  });
};

const addMissingRecordFootNote = (tab) => {
  const rowNumber = tab.lastRow.number + 2;
  const footNoteRange = `B${rowNumber}:E${rowNumber + 2}`;

  addText(tab, footNoteRange, MissingRecordsExplanationText, {}, { alignment: alignments.topLeftWrapText });
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
    field: ['careCertAndQualificationLevels', 'socialCareQualificationLevel', Level2OrAbove],
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
    field: ['careCertAndQualificationLevels', 'socialCareQualificationLevel', Level5OrAbove],
  },
];

module.exports = { generateParentSummaryTab };
