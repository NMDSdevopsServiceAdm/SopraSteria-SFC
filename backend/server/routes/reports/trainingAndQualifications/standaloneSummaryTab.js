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
    45, 45, 33, 12, 45, 45, 10, 20, 45, 10, 20, 45, 10, 20, 45, 10, 20, 45, 10, 20, 45, 10, 45, 18, 45, 10, 10, 22,
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
  addText(tab, 'D3:J3', 'Summary', { size: 24, bold: true }, { alignment: alignments.bottomLeft });

  addText(
    tab,
    'Y3:AB3',
    formatDateTime(new Date(), 'DD MMMM YYYY, HH:mm'),
    { size: 13, bold: true },
    { alignment: alignments.bottomRight },
  );

  setColourForRange(tab, 'A2:AN4', { backgroundColour: newBackgroundColours.lightGrey });
};

const drawColouredArea = (tab) => {
  setColourForRange(tab, 'B6:N28', { backgroundColour: newBackgroundColours.lightGrey });
  setColourForRange(tab, 'P6:AB28', { backgroundColour: newBackgroundColours.lightGrey });

  const whiteAreas = ['C7:E19', 'G7:I19', 'K7:M19', 'G21:I26', 'Q7:S16', 'U7:W16', 'Y7:AA22'];
  const totals = ['D8:D9', 'H8:H9', 'L8:L9'];
  const expiredOrMissing = ['D11:D12', 'H11:H12', 'L11:L12', 'H24:H25'];
  const expiringSoon = ['D14:D15', 'H14:H15', 'L14:L15'];
  const upToDate = ['D17:D18', 'H17:H18', 'L17:L18'];

  const whiteTextOnBlue = ['R8:R9', 'R11:R12', 'R14:R15', 'V8:V9', 'V11:V12', 'V14:V15', 'Z8:Z9'];
  const darkBlueTextOnLightBlue = ['Z11:Z12', 'Z14:Z15', 'Z17:Z18', 'Z20:Z21'];

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
      range: 'D5:L5',
      value: 'All staff (could include staff flagged as long-term absent)',
      size: 18,
      alignment: alignments.middleCenter,
    },
    { range: 'H20:H22', value: MissingRecordsExplanationText, alignment: alignments.leftMiddleWrapText },
  ];

  const columnHeadings = [
    { range: 'D6', value: 'All training records' },
    { range: 'H6', value: 'Mandatory training records' },
    { range: 'L6', value: 'Non-mandatory training records' },
  ].map((cell) => ({ ...cell, size: 14 }));

  const cellLabels = [
    { range: 'D8', value: 'Total' },
    { range: 'D11', value: 'Expired' },
    { range: 'D14', value: 'Expiring soon' },
    { range: 'D17', value: 'Up-to-date' },

    { range: 'H8', value: 'Total' },
    { range: 'H11', value: 'Expired' },
    { range: 'H14', value: 'Expiring soon' },
    { range: 'H17', value: 'Up-to-date' },

    { range: 'L8', value: 'Total' },
    { range: 'L11', value: 'Expired' },
    { range: 'L14', value: 'Expiring soon' },
    { range: 'L17', value: 'Up-to-date' },

    { range: 'H24', value: 'Missing records' },
  ].map((cell) => ({ ...cell, alignment: alignments.bottomCenter }));

  const mandatoryTrainingCells = buildMandatoryTrainingCells(totals);

  const numbers = [
    { range: 'D9', value: totals.trainingCount },
    { range: 'D12', value: totals.expiredTrainingCount },
    { range: 'D15', value: totals.expiringTrainingCount },
    { range: 'D18', value: totals.upToDateTrainingCount },

    { range: 'L9', value: totals.nonMandatoryTrainingCount },
    { range: 'L12', value: totals.expiredNonMandatoryTrainingCount },
    { range: 'L15', value: totals.expiringNonMandatoryTrainingCount },
    { range: 'L18', value: totals.upToDateNonMandatoryTrainingCount },
  ].map((cell) => ({ ...cell, size: 30 }));

  const cellData = columnHeadings.concat(longTexts, cellLabels, mandatoryTrainingCells, numbers);

  cellData.forEach(({ range, value, size, alignment }) => {
    const font = { size: size ?? 12, bold: true };
    const textAlignment = alignment ? { alignment } : { alignment: alignments.middleCenter };
    addText(tab, range, value, font, textAlignment);
  });
};

const buildMandatoryTrainingCells = (totals) => {
  const workplaceHasNoMandatoryTraining = totals.mandatoryTrainingCount + totals.missingMandatoryTrainingCount === 0;

  const showTotalCount = { range: 'H9', value: totals.mandatoryTrainingCount, size: 30 };
  const showSpecialMessage = {
    range: 'H9',
    value: noMandatoryTrainingMessage,
    size: 14,
    alignment: alignments.middleCenterWrapText,
  };

  const totalCell = workplaceHasNoMandatoryTraining ? showSpecialMessage : showTotalCount;

  const otherCells = [
    { range: 'H12', value: totals.expiredMandatoryTrainingCount },
    { range: 'H15', value: totals.expiringMandatoryTrainingCount },
    { range: 'H18', value: totals.upToDateMandatoryTrainingCount },
    { range: 'H25', value: totals.missingMandatoryTrainingCount },
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
      range: 'P5:AA5',
      value: sectionHeadingText,
      size: 18,
      alignment: alignments.middleCenter,
    },
  ];
  const longTexts = [
    { range: 'Q17:W20', value: careCertExplanationText, size: 12, alignment: alignments.middleLeftWrapText },
    { range: 'Q21:W22', value: careCertNotesText, size: 12, alignment: alignments.topLeftWrapText },
  ];

  const columnHeadings = [
    { range: 'R6', value: 'Care Certificates' },
    { range: 'V6', value: 'L2 Adult Social Care Certificates' },
    { range: 'Z6', value: 'Social care qualification levels' },
  ].map((cell) => ({ ...cell, size: 14 }));

  const cellLabels = [
    { range: 'R8', value: 'Completed' },
    { range: 'R11', value: 'Started or partially completed' },
    { range: 'R14', value: 'Not started' },

    { range: 'V8', value: 'Completed' },
    { range: 'V11', value: 'Started' },
    { range: 'V14', value: 'Not started' },

    { range: 'Z8', value: 'Level 2 or higher' },
    { range: 'Z11', value: 'Level 2' },
    { range: 'Z14', value: 'Level 3' },
    { range: 'Z17', value: 'Level 4' },
    { range: 'Z20', value: 'Level 5 or above' },
  ].map((cell) => ({ ...cell, alignment: alignments.bottomCenter }));

  const numbers = [
    { range: 'R9', value: data?.careCertificate?.[WorkerCareCertificate.YesCompleted] },
    { range: 'R12', value: data?.careCertificate?.[WorkerCareCertificate.YesInProgress] },
    { range: 'R15', value: data?.careCertificate?.[WorkerCareCertificate.No] },
    { range: 'V9', value: data?.level2CareCertificate?.[WorkerLevel2CareCertificate.YesCompleted] },
    { range: 'V12', value: data?.level2CareCertificate?.[WorkerLevel2CareCertificate.YesStarted] },
    { range: 'V15', value: data?.level2CareCertificate?.[WorkerLevel2CareCertificate.No] },
  ].map((cell) => {
    const cellValue = cell.value ?? defaultValue;
    return { ...cell, value: cellValue, size: 30 };
  });

  const percentages = [
    { range: 'Z9', value: data?.socialCareQualificationLevel?.['Level 2 or above'] },
    { range: 'Z12', value: data?.socialCareQualificationLevel?.['Level 2'] },
    { range: 'Z15', value: data?.socialCareQualificationLevel?.['Level 3'] },
    { range: 'Z18', value: data?.socialCareQualificationLevel?.['Level 4'] },
    { range: 'Z21', value: data?.socialCareQualificationLevel?.['Level 5 or above'] },
  ].map((cell) => {
    const cellValue = cell.value ?? defaultValue;
    return { ...cell, value: cellValue, size: 30 };
  });

  const cellData = sectionHeading.concat(columnHeadings, longTexts, cellLabels, numbers, percentages);

  cellData.forEach(({ range, value, size, alignment }) => {
    const font = { size: size ?? 12, bold: true };
    const textAlignment = alignment ? { alignment } : { alignment: alignments.middleCenter };
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
