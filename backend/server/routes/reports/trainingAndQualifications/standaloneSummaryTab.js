const {
  addText,
  setColourForRange,
  newBackgroundColours,
  drawColourBoxWithBorder,
  newTextColours,
  alignments,
  newStandardFont,
} = require('../../../utils/excelUtils');
const { WorkerCareCertificate, WorkerLevel2CareCertificate } = require('../../../../reference/databaseEnumTypes');

const generateSummaryTab = async (workbook, summaryTabData) => {
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
  addText(tab, 'D3:Z3', 'Summary', { size: 24, bold: true });

  setColourForRange(tab, 'A2:AN3', { backgroundColour: newBackgroundColours.lightGrey });
};

const drawColouredArea = (tab) => {
  setColourForRange(tab, 'B5:N27', { backgroundColour: newBackgroundColours.lightGrey });
  setColourForRange(tab, 'P5:AB27', { backgroundColour: newBackgroundColours.lightGrey });

  const colourBoxes = [
    { range: 'C6:E18', backgroundColour: newBackgroundColours.white },
    { range: 'G6:I18', backgroundColour: newBackgroundColours.white },
    { range: 'K6:M18', backgroundColour: newBackgroundColours.white },
    { range: 'G20:I26', backgroundColour: newBackgroundColours.white },
    { range: 'Q6:S15', backgroundColour: newBackgroundColours.white },
    { range: 'U6:W15', backgroundColour: newBackgroundColours.white },
    { range: 'Y6:AA21', backgroundColour: newBackgroundColours.white },

    { range: 'D7:D8', backgroundColour: newBackgroundColours.lightGrey },
    { range: 'D10:D11', backgroundColour: newBackgroundColours.red },
    { range: 'D13:D14', backgroundColour: newBackgroundColours.orange },
    { range: 'D16:D17', backgroundColour: newBackgroundColours.green },

    { range: 'H7:H8', backgroundColour: newBackgroundColours.lightGrey },
    { range: 'H10:H11', backgroundColour: newBackgroundColours.red },
    { range: 'H13:H14', backgroundColour: newBackgroundColours.orange },
    { range: 'H16:H17', backgroundColour: newBackgroundColours.green },

    { range: 'L7:L8', backgroundColour: newBackgroundColours.lightGrey },
    { range: 'L10:L11', backgroundColour: newBackgroundColours.red },
    { range: 'L13:L14', backgroundColour: newBackgroundColours.orange },
    { range: 'L16:L17', backgroundColour: newBackgroundColours.green },

    { range: 'H23:H24', backgroundColour: newBackgroundColours.red },

    { range: 'R7:R8', backgroundColour: newBackgroundColours.darkBlue, textColour: newTextColours.white },
    { range: 'R10:R11', backgroundColour: newBackgroundColours.darkBlue, textColour: newTextColours.white },
    { range: 'R13:R14', backgroundColour: newBackgroundColours.darkBlue, textColour: newTextColours.white },

    { range: 'V7:V8', backgroundColour: newBackgroundColours.darkBlue, textColour: newTextColours.white },
    { range: 'V10:V11', backgroundColour: newBackgroundColours.darkBlue, textColour: newTextColours.white },
    { range: 'V13:V14', backgroundColour: newBackgroundColours.darkBlue, textColour: newTextColours.white },

    { range: 'Z7:Z8', backgroundColour: newBackgroundColours.darkBlue, textColour: newTextColours.white },

    { range: 'Z10:Z11', backgroundColour: newBackgroundColours.lightBlue, textColour: newTextColours.darkBlue },
    { range: 'Z13:Z14', backgroundColour: newBackgroundColours.lightBlue, textColour: newTextColours.darkBlue },
    { range: 'Z16:Z17', backgroundColour: newBackgroundColours.lightBlue, textColour: newTextColours.darkBlue },
    { range: 'Z19:Z20', backgroundColour: newBackgroundColours.lightBlue, textColour: newTextColours.darkBlue },
  ];

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
    { range: 'H20:H22', value: missingRecordsExplanationText, alignment: alignments.leftMiddleWrapText },
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

  const mandatoryTrainingCells = [
    { range: 'H8', value: totals.mandatoryTrainingCount },
    { range: 'H11', value: totals.expiredMandatoryTrainingCount },
    { range: 'H14', value: totals.expiringMandatoryTrainingCount },
    { range: 'H17', value: totals.upToDateMandatoryTrainingCount },
    { range: 'H24', value: totals.missingMandatoryTrainingCount },
  ];

  const numbers = [
    { range: 'D8', value: totals.trainingCount },
    { range: 'D11', value: totals.expiredTrainingCount },
    { range: 'D14', value: totals.expiringTrainingCount },
    { range: 'D17', value: totals.upToDateTrainingCount },

    ...mandatoryTrainingCells,

    { range: 'L8', value: totals.nonMandatoryTrainingCount },
    { range: 'L11', value: totals.expiredNonMandatoryTrainingCount },
    { range: 'L14', value: totals.expiringNonMandatoryTrainingCount },
    { range: 'L17', value: totals.upToDateNonMandatoryTrainingCount },
  ].map((cell) => ({ ...cell, size: 30 }));

  const cellData = columnHeadings.concat(longTexts, cellLabels, numbers);

  cellData.forEach(({ range, value, size, alignment }) => {
    const font = { size: size ?? 12, bold: true };
    const textAlignment = alignment ? { alignment } : { alignment: alignments.centerMiddle };
    addText(tab, range, value, font, textAlignment);
  });
};

const addCareCertAndQualificationLevels = (tab, careCertAndQualificationLevels) => {
  const data = careCertAndQualificationLevels;
  const defaultValue = data?.careProvidingStaffsCount > 0 ? 0 : '-';

  const sectionHeading = `Care-providing staff only (${data?.careProvidingStaffsCount ?? 0})`;

  const longTexts = [
    {
      range: 'P4:AA4',
      value: sectionHeading,
      size: 18,
      alignment: alignments.centerMiddle,
    },
    { range: 'Q16:W17', value: careCertExplanationText, size: 12, alignment: alignments.leftMiddleWrapText },
    { range: 'Q19:W20', value: careCertNotesText, size: 12, alignment: alignments.leftMiddleWrapText },
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

  const cellData = columnHeadings.concat(longTexts, cellLabels, numbers, percentages);

  cellData.forEach(({ range, value, size, alignment }) => {
    const font = { size: size ?? 12, bold: true };
    const textAlignment = alignment ? { alignment } : { alignment: alignments.centerMiddle };
    addText(tab, range, value, font, textAlignment);
  });

  setSocialCareQualificationLevelToPercentage(tab, percentages);
};

const setSocialCareQualificationLevelToPercentage = (tab, percentageCells) => {
  percentageCells.forEach(({ range }) => {
    const cell = tab.getCell(range);
    cell.numFmt = '0%';
  });
};

const missingRecordsExplanationText = {
  richText: [
    { font: { size: 12, bold: true, family: 4 }, text: 'Missing records.' },
    {
      font: {
        size: 12,
        family: 4,
      },
      text: ' If a training category is mandatory, you must add a record for everybody who needs that training. Note, missing records may include training not yet taken by new starters.',
    },
  ],
};

const careCertExplanationText = {
  richText: [
    {
      font: newStandardFont,
      text: 'The Care Certificates, L2 Adult Social Care Certificates and social care qualifications summary statistics only refer to care-providing staff (this includes care and support workers, registered and deputy managers, supervisors and team leaders).',
    },
  ],
};

const careCertNotesText = {
  richText: [
    {
      font: newStandardFont,
      text: 'Note, the data displayed in this report has been generated from both staff records and from training and qualification records.',
    },
  ],
};

module.exports.generateSummaryTab = generateSummaryTab;
