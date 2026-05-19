const lodash = require('lodash');

const { convertWorkerTrainingBreakdowns, getTrainingTotals } = require('../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  backgroundColours,
  textColours,
  setCellTextAndBackgroundColour,
  setTableHeadingsStyle,
  alignColumnToLeft,
  addBordersToAllFilledCells,
  addText,
  setColourForRange,
  newBackgroundColours,
  drawColourBoxWithBorder,
  newTextColours,
  alignments,
} = require('../../../utils/excelUtils');

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

const generateSummaryTab = async (workbook, establishmentData) => {
  const summaryTab = workbook.addWorksheet('Summary', { views: [{ showGridLines: false }] });
  const establishmentName = establishmentData.establishment.NameValue;

  setHeightAndWidths(summaryTab);
  addBannerImage(workbook, summaryTab);
  addTitle(summaryTab, establishmentName);

  drawColouredArea(summaryTab);

  addStaffsBreakdown(summaryTab, establishmentData.workerTrainingBreakdowns);
};

const setHeightAndWidths = (tab) => {
  const columnWidths = [
    2.5, 3, 1.75, 33, 1.75, 1.75, 1.75, 33, 1.75, 1.75, 1.75, 33, 1.75, 3, 2.4, 3, 1.75, 33, 1.75, 1.75, 1.75, 33, 1.75,
    1.75, 1.75, 33, 1.75, 3,
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
    { range: 'Z10:Z11', backgroundColour: newBackgroundColours.lightBlue, textColour: newTextColours.white },
    { range: 'Z13:Z14', backgroundColour: newBackgroundColours.lightBlue, textColour: newTextColours.white },
    { range: 'Z16:Z17', backgroundColour: newBackgroundColours.lightBlue, textColour: newTextColours.white },
    { range: 'Z19:Z20', backgroundColour: newBackgroundColours.lightBlue, textColour: newTextColours.white },
  ];

  colourBoxes.forEach((colourBox) => {
    drawColourBoxWithBorder(tab, colourBox.range, {
      backgroundColour: colourBox.backgroundColour,
      textColour: colourBox.textColour ?? newTextColours.black,
    });
  });
};

const calculateTotals = (workerTrainingBreakdowns) => {
  if (!workerTrainingBreakdowns?.length) {
    return {};
  }

  const fieldNames = Object.keys(workerTrainingBreakdowns[0]);
  const numericFields = fieldNames.filter((field) => field.endsWith('Count'));
  const result = {};

  numericFields.forEach((field) => {
    const countsForAllWorkersOfThisField = lodash.map(workerTrainingBreakdowns, field);
    const total = lodash.sum(countsForAllWorkersOfThisField);
    result[field] = total;
  });

  return result;
};

const addStaffsBreakdown = (tab, workerTrainingBreakdowns) => {
  const totals = calculateTotals(workerTrainingBreakdowns);

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

  const numbers = [
    { range: 'D8', value: totals.trainingCount },
    { range: 'D11', value: totals.expiredTrainingCount },
    { range: 'D14', value: totals.expiringTrainingCount },
    { range: 'D17', value: totals.upToDateTrainingCount },
    { range: 'H8', value: totals.mandatoryTrainingCount },
    { range: 'H11', value: totals.expiredMandatoryTrainingCount },
    { range: 'H14', value: totals.expiringMandatoryTrainingCount },
    { range: 'H17', value: totals.upToDateMandatoryTrainingCount },
    { range: 'L8', value: totals.nonMandatoryTrainingCount },
    { range: 'L11', value: totals.expiredNonMandatoryTrainingCount },
    { range: 'L14', value: totals.expiringNonMandatoryTrainingCount },
    { range: 'L17', value: totals.upToDateNonMandatoryTrainingCount },
    { range: 'H24', value: totals.missingMandatoryTrainingCount },
  ].map((cell) => ({ ...cell, size: 30 }));

  const cellData = columnHeadings.concat(longTexts, cellLabels, numbers);

  cellData.forEach(({ range, value, size, alignment }) => {
    const font = { size, bold: true };
    const textAlignment = alignment ? { alignment } : { alignment: alignments.centerMiddle };
    addText(tab, range, value, font, textAlignment);
  });
};

module.exports.generateSummaryTab = generateSummaryTab;
