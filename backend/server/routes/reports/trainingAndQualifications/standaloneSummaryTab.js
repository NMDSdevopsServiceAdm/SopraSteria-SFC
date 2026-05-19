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
} = require('../../../utils/excelUtils');

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
    2.5, 3, 1.75, 32, 1.75, 1.75, 1.75, 32, 1.75, 1.75, 1.75, 32, 1.75, 3, 2.4, 3, 1.75, 32, 1.75, 1.75, 1.75, 32, 1.75,
    1.75, 1.75, 32, 1.75, 3,
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
  // TODO: refactor DIY
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

  addText(tab, 'D4:L4', 'All staff (could include staff flagged as long-term absent)', { bold: true, size: 18 });

  const cellData = {
    D5: 'All training records',
    D8: totals.trainingCount,
    D11: totals.expiredTrainingCount,
    D14: totals.expiringTrainingCount,
    D17: totals.upToDateTrainingCount,

    H5: 'Mandatory training records',
    H8: totals.mandatoryTrainingCount,
    H11: totals.expiredMandatoryTrainingCount,
    H14: totals.expiringMandatoryTrainingCount,
    H17: totals.upToDateMandatoryTrainingCount,

    L5: 'Non-mandatory training records',
    L8: totals.nonMandatoryTrainingCount,
    L11: totals.expiredNonMandatoryTrainingCount,
    L14: totals.expiringNonMandatoryTrainingCount,
    L17: totals.upToDateNonMandatoryTrainingCount,

    D7: 'Total',
    H7: 'Total',
    L7: 'Total',
    D10: 'Expired',
    H10: 'Expired',
    L10: 'Expired',
    D13: 'Expiring soon',
    H13: 'Expiring soon',
    L13: 'Expiring soon',
    D16: 'Up-to-date',
    H16: 'Up-to-date',
    L16: 'Up-to-date',

    'H20:H22': {
      richText: [
        { font: { size: 12, bold: true, family: 4 }, text: 'Missing records.' },
        {
          font: {
            size: 12,
            family: 4,
          },
          text: 'If a training category is mandatory, you must add a record for everybody who needs that training. Note, missing records may include training not yet taken by new starters.',
        },
      ],
    },
    H23: 'Missing records',
    H24: totals.missingMandatoryTrainingCount,
  };

  Object.entries(cellData).forEach(([coord, value]) => {
    addText(tab, coord, value);
  });
};

module.exports.generateSummaryTab = generateSummaryTab;
