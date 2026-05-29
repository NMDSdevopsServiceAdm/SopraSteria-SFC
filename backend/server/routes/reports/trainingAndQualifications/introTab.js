const path = require('node:path');

const {
  addHeading,
  newBackgroundColours,
  newTextColours,
  addLink,
  borderStyles,
  addText,
  setColourForRange,
  applyStyleToRange,
  alignments,
} = require('../../../utils/excelUtils');
const { formatDateTime } = require('../../../utils/dateUtils');

const introductionText =
  'You could use this report internally (with board members, management and team leaders) and externally (with the CQC and local authorities). ' +
  'Monitor, manage and report on staff training and education at a staff level and at a training category level. It could also help you forecast ' +
  'and plan training, procure and book staff onto courses, and identify any training gaps.\r\n\r\n' +
  "Note, your report will only provide a full view of mandatory training once you've set up your mandatory training accurately in ASC-WDS.";

const generateIntroTab = async (workbook, establishment) => {
  const introTab = workbook.addWorksheet('Introduction', { views: [{ showGridLines: false }] });

  setCellSizeAndFormats(introTab);
  addBannerImage(workbook, introTab);
  addHeadingsToIntroTab(introTab, establishment);

  addText(introTab, 'B6:H10', introductionText, { size: 12 });
  introTab.getCell('B6').alignment = { wrapText: true, vertical: 'top' };

  addLinksToOtherTabs(introTab);
};

const setCellSizeAndFormats = (tab) => {
  const columnWidths = [8, Array(5).fill(12.5), 14.5, 8].flat();
  const rowHeights = [Array(2).fill(45), 33, 12, 45, Array(4).fill(28), 33, 37, Array(9).fill(31)].flat();

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
    column.alignment = { vertical: 'middle' };
  });
  rowHeights.forEach((height, index) => {
    tab.getRow(index + 1).height = height;
  });

  setColourForRange(tab, 'A2:Z4', { backgroundColour: newBackgroundColours.lightGrey });
  setColourForRange(tab, 'A11:H19', { backgroundColour: newBackgroundColours.lightGrey });
};

const addBannerImage = (workbook, introTab) => {
  const bannerImageId = workbook.addImage({
    filename: path.join(__dirname, '../../../assets/images/excelReportBanner.jpg'),
    extension: 'jpeg',
  });
  introTab.addImage(bannerImageId, { tl: { col: 1, row: 0 }, ext: { width: 431, height: 62.4 } });
};

const addHeadingsToIntroTab = (introTab, establishment) => {
  addText(introTab, 'B2:H2', establishment.NameValue, { size: 26, bold: true });
  setWorkplaceNameTextWrap(introTab, establishment);

  addText(
    introTab,
    'B3:F3',
    'Training and qualifications report',
    { size: 24, bold: true },
    { alignment: alignments.bottomLeft },
  );
  addText(
    introTab,
    'G3:H3',
    formatDateTime(new Date(), 'DD MMMM YYYY, HH:mm'),
    { size: 13, bold: true },
    { alignment: alignments.bottomRight },
  );
  addText(introTab, 'B5:H5', 'Introduction: how you can use this report', { size: 18, bold: true });
};

const setWorkplaceNameTextWrap = (introTab, establishment) => {
  const numberOfLinesNeeded = Math.ceil(establishment.NameValue?.length / 36);
  if (numberOfLinesNeeded <= 1) {
    return;
  }

  const workplaceNameCell = introTab.getCell('B2');
  workplaceNameCell.alignment = { ...workplaceNameCell.alignment, wrapText: true };

  const workplaceNameRow = introTab.getRow(2);
  workplaceNameRow.height = workplaceNameRow.height * numberOfLinesNeeded - 20;
};

const addLinksToOtherTabs = (introTab) => {
  const links = [
    { text: 'Summary', hyperlink: "#'Summary'!A1" },
    { text: 'Training records by staff', hyperlink: "#'Training by staff'!A1" },
    { text: 'Training records by category', hyperlink: "#'Training by category'!A1" },
    { text: 'Expired and missing training', hyperlink: "#'Expired training'!A1" },
    { text: 'Training record details', hyperlink: "#'Training record details'!A1" },
    { text: 'Care Certificates', hyperlink: "#'Care Certificates'!A1" },
    { text: 'Qualification record details', hyperlink: "#'Qualification record details'!A1" },
  ];

  addHeading(introTab, 'B11', 'H11', 'Menu', newTextColours.black, 18);

  links.forEach((link, index) => {
    const rowNumber = 12 + index;
    addLink(introTab, `B${rowNumber}:G${rowNumber}`, link, { size: 16 });

    applyStyleToRange(introTab, `B${rowNumber}:G${rowNumber}`, { border: borderStyles.lightGreyBorderTopAndBottom });
  });
};

module.exports = { generateIntroTab, addHeadingsToIntroTab, addLinksToOtherTabs };
