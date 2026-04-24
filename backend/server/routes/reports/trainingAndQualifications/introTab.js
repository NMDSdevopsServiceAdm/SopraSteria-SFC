const {
  addHeading,
  newBackgroundColours,
  newTextColours,
  forEachColumnInRange,
  forEachCellInRange,
  addLink,
  topAndBottomGreyBorder,
  addText,
} = require('../../../utils/excelUtils');
const models = require('../../../models');
const dayjs = require('dayjs');
const path = require('node:path');

const introductionText =
  'You could use this report internally (with board members, management and team leaders) and externally (with the CQC and local authorities). ' +
  'Monitor, manage and report on staff training and education at a staff level and at a training category level. It could also help you forecast ' +
  'and plan training, procure and book staff onto courses, and identify any training gaps.\r\n\r\n' +
  "Note, your report will only provide a full view of mandatory training once you've set up your mandatory training accurately in ASC-WDS.";

const generateIntroTab = async (workbook, establishmentId) => {
  const establishment = await models.establishment.findByPk(establishmentId, { raw: true });
  const introTab = workbook.addWorksheet('Introduction', { views: [{ showGridLines: false }] });

  setCellSizeAndFormats(introTab);
  addBannerImage(workbook, introTab);
  addHeadingsToIntroTab(introTab, establishment);

  addText(introTab, 'B5:H9', introductionText, { size: 12 });
  introTab.getCell('B5').alignment = { wrapText: true, vertical: 'top' };

  addLinksToOtherTabs(introTab);
};

const setCellSizeAndFormats = (tab) => {
  forEachColumnInRange(tab, 'B2:F2', (column) => {
    column.width = 12;
    column.alignment = { vertical: 'middle' };
  });
  tab.getColumn('G').width = 18.5;
  tab.getColumn('G').alignment = { vertical: 'middle' };

  tab.getColumn('H').width = 3.5;

  const rowHeights = [Array(4).fill(48), Array(5).fill(24), 37, Array(9).fill(31)].flat();

  rowHeights.forEach((height, index) => {
    tab.getRow(index + 1).height = height;
  });

  forEachCellInRange(tab, 'A2:Z3', (cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: newBackgroundColours.lightGrey,
    };
  });

  forEachCellInRange(tab, 'A10:H18', (cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: newBackgroundColours.lightGrey,
    };
  });
};

const addBannerImage = (workbook, introTab) => {
  const bannerImageId = workbook.addImage({
    filename: path.join(__dirname, '../../../assets/images/excelReportBanner.jpg'),
    extension: 'jpeg',
  });
  introTab.addImage(bannerImageId, 'B1:F1');
};

const addHeadingsToIntroTab = (introTab, establishment) => {
  addHeading(introTab, 'B2', 'H2', establishment.NameValue, newTextColours.black, 26);
  addHeading(introTab, 'B3', 'F3', 'Training and qualifications report', newTextColours.black, 24);
  addHeading(introTab, 'G3', 'H3', dayjs().format('DD MMMM YYYY, HH:mm'), newTextColours.black, 13);

  addHeading(introTab, 'B4', 'H4', 'Introduction: how you can use this report', newTextColours.black, 18);
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

  addHeading(introTab, 'B10', 'H10', 'Menu', newTextColours.black, 18);

  links.forEach((link, index) => {
    const rowNumber = 11 + index;
    addLink(introTab, `B${rowNumber}:G${rowNumber}`, link, { size: 16 });
    const cell = introTab.getCell(`B${rowNumber}`);
    cell.border = topAndBottomGreyBorder;
  });
};

module.exports = { generateIntroTab, addHeadingsToIntroTab, addLinksToOtherTabs };
