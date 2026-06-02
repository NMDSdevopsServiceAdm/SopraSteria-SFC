const {
  addText,
  setColourForRange,
  newBackgroundColours,
  drawColourBoxWithBorder,
  newTextColours,
  alignments,
  applyStyleToRange,
  MissingRecordsExplanationText,
} = require('../../../utils/excelUtils');
const { WorkerCareCertificate, WorkerLevel2CareCertificate } = require('../../../../reference/databaseEnumTypes');
const { formatDateTime } = require('../../../utils/dateUtils');

const generateSummaryTab = (workbook, summaryTabData) => {
  if (!summaryTabData) {
    return;
  }

  const summaryTab = workbook.addWorksheet('Summary', { views: [{ showGridLines: false }] });
  const establishmentName = summaryTabData.workplaceName;

  setHeightAndWidths(summaryTab);
  addBannerImage(workbook, summaryTab);
  addTitle(summaryTab, establishmentName);

  drawColouredArea(summaryTab);

  addtrainingBreakdownTotals(summaryTab, summaryTabData.trainingBreakdownTotals);
  addCareCertAndQualificationLevels(summaryTab, summaryTabData.careCertAndQualificationLevels);
};

const setHeightAndWidths = (tab) => {
  const columnWidths = [
    2.5, 3, 1.75, 33, 1.75, 1.75, 1.75, 33, 1.75, 1.75, 1.75, 33, 1.75, 3.5, 3, 3.5, 1.75, 33, 1.75, 1.75, 1.75, 33,
    1.75, 1.75, 1.75, 33, 1.75, 3,
  ];
  const rowHeights = [
    45, 45, 45, 45, 45, 10, 20, 45, 10, 20, 45, 10, 20, 45, 10, 20, 45, 10, 20, 45, 10, 45, 18, 45, 10, 10, 22,
  ];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
    column.alignment = { vertical: 'middle' };
  });

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });
};

const addBannerImage = (workbook, tab) => {
  tab.addImage(0, { tl: { col: 3, row: 0 }, ext: { width: 431, height: 62.4 } });
};

const addTitle = (tab, establishmentName) => {
  addText(tab, 'D2:J2', establishmentName, { size: 26, bold: true });
  addText(tab, 'D3:J3', 'Summary', { size: 24, bold: true });

  addText(
    tab,
    'Y3:AB3',
    formatDateTime(new Date(), 'DD MMMM YYYY, HH:mm'),
    { size: 13, bold: true },
    { alignment: alignments.rightMiddle },
  );

  setColourForRange(tab, 'A2:AN3', { backgroundColour: newBackgroundColours.lightGrey });
};

const drawColouredArea = (tab) => {
  setColourForRange(tab, 'B5:N27', { backgroundColour: newBackgroundColours.lightGrey });
  setColourForRange(tab, 'P5:AB27', { backgroundColour: newBackgroundColours.lightGrey });

  const whiteAreas = ['C6:E18', 'G6:I18', 'K6:M18', 'G20:I25', 'Q6:S15', 'U6:W15', 'Y6:AA21'];
  const totals = ['D7:D8', 'H7:H8', 'L7:L8'];
  const expiredOrMissing = ['D10:D11', 'H10:H11', 'L10:L11', 'H23:H24'];
  const expiringSoon = ['D13:D14', 'H13:H14', 'L13:L14'];
  const upToDate = ['D16:D17', 'H16:H17', 'L16:L17'];

  const whiteTextOnBlue = ['R7:R8', 'R10:R11', 'R13:R14', 'V7:V8', 'V10:V11', 'V13:V14', 'Z7:Z8'];
  const darkBlueTextOnLightBlue = ['Z10:Z11', 'Z13:Z14', 'Z16:Z17', 'Z19:Z20'];

  const colourBoxes = [
    whiteAreas.map((range) => ({ range, backgroundColour: newBackgroundColours.white })),
    totals.map((range) => ({ range, backgroundColour: newBackgroundColours.lightGrey })),
    expiredOrMissing.map((range) => ({ range, backgroundColour: newBackgroundColours.red })),
    expiringSoon.map((range) => ({ range, backgroundColour: newBackgroundColours.orange })),
    upToDate.map((range) => ({ range, backgroundColour: newBackgroundColours.green })),

    whiteTextOnBlue.map((range) => ({
      range,
      backgroundColour: newBackgroundColours.darkBlue,
      textColour: newTextColours.white,
    })),

    darkBlueTextOnLightBlue.map((range) => ({
      range,
      backgroundColour: newBackgroundColours.lightBlue,
      textColour: newTextColours.darkBlue,
    })),
  ].flat();

  colourBoxes.forEach((colourBox) => {
    drawColourBoxWithBorder(tab, colourBox.range, {
      backgroundColour: colourBox.backgroundColour,
      textColour: colourBox.textColour ?? newTextColours.black,
    });
  });
};

const addtrainingBreakdownTotals = (tab, trainingBreakdownTotals) => {
  const totals = trainingBreakdownTotals;
  const longTexts = [
    {
      range: 'D4:L4',
      value: 'All staff (could include staff flagged as long-term absent)',
      size: 18,
      alignment: alignments.centerMiddle,
    },
    { range: 'H20:H22', value: MissingRecordsExplanationText, alignment: alignments.leftMiddleWrapText },
  ];

  const columnHeadings = [
    { range: 'D5', value: 'All training records' },
    { range: 'H5', value: 'Mandatory training records' },
    { range: 'L5', value: 'Non-mandatory training records' },
  ].map((cell) => ({ ...cell, size: 14 }));

  const cellLabels = [
    { range: 'D7', value: 'Total' },
    { range: 'D10', value: 'Expired' },
    { range: 'D13', value: 'Expiring soon' },
    { range: 'D16', value: 'Up-to-date' },

    { range: 'H7', value: 'Total' },
    { range: 'H10', value: 'Expired' },
    { range: 'H13', value: 'Expiring soon' },
    { range: 'H16', value: 'Up-to-date' },

    { range: 'L7', value: 'Total' },
    { range: 'L10', value: 'Expired' },
    { range: 'L13', value: 'Expiring soon' },
    { range: 'L16', value: 'Up-to-date' },

    { range: 'H23', value: 'Missing records' },
  ].map((cell) => ({ ...cell, alignment: alignments.centerBottom }));

  const mandatoryTrainingCells = buildMandatoryTrainingCells(totals);

  const numbers = [
    { range: 'D8', value: totals.trainingCount },
    { range: 'D11', value: totals.expiredTrainingCount },
    { range: 'D14', value: totals.expiringTrainingCount },
    { range: 'D17', value: totals.upToDateTrainingCount },

    { range: 'L8', value: totals.nonMandatoryTrainingCount },
    { range: 'L11', value: totals.expiredNonMandatoryTrainingCount },
    { range: 'L14', value: totals.expiringNonMandatoryTrainingCount },
    { range: 'L17', value: totals.upToDateNonMandatoryTrainingCount },
  ].map((cell) => ({ ...cell, size: 30 }));

  const cellData = columnHeadings.concat(longTexts, cellLabels, mandatoryTrainingCells, numbers);

  cellData.forEach(({ range, value, size, alignment }) => {
    const font = { size: size ?? 12, bold: true };
    const textAlignment = alignment ? { alignment } : { alignment: alignments.centerMiddle };
    addText(tab, range, value, font, textAlignment);
  });
};

const buildMandatoryTrainingCells = (totals) => {
  const workplaceHasNoMandatoryTraining = totals.mandatoryTrainingCount + totals.missingMandatoryTrainingCount === 0;

  const showTotalCount = { range: 'H8', value: totals.mandatoryTrainingCount, size: 30 };
  const showSpecialMessage = {
    range: 'H8',
    value: noMandatoryTrainingMessage,
    size: 14,
    alignment: alignments.centerMiddleWrapText,
  };

  const totalCell = workplaceHasNoMandatoryTraining ? showSpecialMessage : showTotalCount;

  const otherCells = [
    { range: 'H11', value: totals.expiredMandatoryTrainingCount },
    { range: 'H14', value: totals.expiringMandatoryTrainingCount },
    { range: 'H17', value: totals.upToDateMandatoryTrainingCount },
    { range: 'H24', value: totals.missingMandatoryTrainingCount },
  ].map((cell) => {
    if (workplaceHasNoMandatoryTraining) {
      return { ...cell, value: '-', size: 30 };
    } else {
      return { ...cell, size: 30 };
    }
  });

  return [totalCell, ...otherCells];
};

const addCareCertAndQualificationLevels = (tab, careCertAndQualificationLevels) => {
  const data = careCertAndQualificationLevels;
  const defaultValue = data?.careProvidingStaffsCount > 0 ? 0 : '-';

  const sectionHeadingText = `Care-providing staff only (${data?.careProvidingStaffsCount ?? 0})`;

  const sectionHeading = [
    {
      range: 'P4:AA4',
      value: sectionHeadingText,
      size: 18,
      alignment: alignments.centerMiddle,
    },
  ];
  const longTexts = [
    { range: 'Q16:W17', value: careCertExplanationText, size: 12, alignment: alignments.leftMiddleWrapText },
    { range: 'Q19:W20', value: careCertNotesText, size: 12, alignment: alignments.topLeftWrapText },
  ];

  const columnHeadings = [
    { range: 'R5', value: 'Care Certificates' },
    { range: 'V5', value: 'L2 Adult Social Care Certificates' },
    { range: 'Z5', value: 'Social care qualification levels' },
  ].map((cell) => ({ ...cell, size: 14 }));

  const cellLabels = [
    { range: 'R7', value: 'Completed' },
    { range: 'R10', value: 'Started or partially completed' },
    { range: 'R13', value: 'Not started' },

    { range: 'V7', value: 'Completed' },
    { range: 'V10', value: 'Started' },
    { range: 'V13', value: 'Not started' },

    { range: 'Z7', value: 'Level 2 or higher' },
    { range: 'Z10', value: 'Level 2' },
    { range: 'Z13', value: 'Level 3' },
    { range: 'Z16', value: 'Level 4' },
    { range: 'Z19', value: 'Level 5 or above' },
  ].map((cell) => ({ ...cell, alignment: alignments.centerBottom }));

  const numbers = [
    { range: 'R8', value: data?.careCertificate?.[WorkerCareCertificate.YesCompleted] },
    { range: 'R11', value: data?.careCertificate?.[WorkerCareCertificate.YesInProgress] },
    { range: 'R14', value: data?.careCertificate?.[WorkerCareCertificate.No] },
    { range: 'V8', value: data?.level2CareCertificate?.[WorkerLevel2CareCertificate.YesCompleted] },
    { range: 'V11', value: data?.level2CareCertificate?.[WorkerLevel2CareCertificate.YesStarted] },
    { range: 'V14', value: data?.level2CareCertificate?.[WorkerLevel2CareCertificate.No] },
  ].map((cell) => {
    const cellValue = cell.value ?? defaultValue;
    return { ...cell, value: cellValue, size: 30 };
  });

  const percentages = [
    { range: 'Z8', value: data?.socialCareQualificationLevel?.['Level 2 or above'] },
    { range: 'Z11', value: data?.socialCareQualificationLevel?.['Level 2'] },
    { range: 'Z14', value: data?.socialCareQualificationLevel?.['Level 3'] },
    { range: 'Z17', value: data?.socialCareQualificationLevel?.['Level 4'] },
    { range: 'Z20', value: data?.socialCareQualificationLevel?.['Level 5 or above'] },
  ].map((cell) => {
    const cellValue = cell.value ?? defaultValue;
    return { ...cell, value: cellValue, size: 30 };
  });

  const cellData = sectionHeading.concat(columnHeadings, longTexts, cellLabels, numbers, percentages);

  cellData.forEach(({ range, value, size, alignment }) => {
    const font = { size: size ?? 12, bold: true };
    const textAlignment = alignment ? { alignment } : { alignment: alignments.centerMiddle };
    addText(tab, range, value, font, textAlignment);
  });

  showAsPercentageFormat(tab, percentages);
  removeBoldForLongTexts(tab, longTexts);
};

const showAsPercentageFormat = (tab, percentageCells) => {
  percentageCells.forEach(({ range }) => {
    const cell = tab.getCell(range);
    cell.numFmt = '0%';
  });
};

const removeBoldForLongTexts = (tab, longTexts) => {
  longTexts.forEach(({ range }) => {
    applyStyleToRange(tab, range, { font: { bold: false } });
  });
};

const noMandatoryTrainingMessage = 'No training categories have been made mandatory yet';

const careCertExplanationText =
  'The Care Certificates, L2 Adult Social Care Certificates and social care qualifications summary statistics only refer to care-providing staff ' +
  '(this includes care and support workers, registered managers, supervisors, team leaders, community support and outreach and other job roles directly involved in providing care).';

const careCertNotesText =
  'Note, the data displayed in this report has been generated from both staff records and from training and qualification records.';

module.exports.generateSummaryTab = generateSummaryTab;
