const {
  addHeadingBlack,
  addSmallHeadingBlack,
  addLine,
  setTableHeadingsStyle,
  backgroundColours,
  textColours,
  fitColumnsToSize,
  addBlankRowIfTableEmpty,
  addBordersToAllFilledCells,
  addBox,
} = require('../../../utils/excelUtils');
const path = require('path');

const generateFundingClaimFormTab = (workbook) => {
  const fundingClaimFormTab = workbook.addWorksheet('Funding Claim Form', { views: [{ showGridLines: false }] });
  addContentToFundingClaimFormTab(workbook, fundingClaimFormTab);
};
const addContentToFundingClaimFormTab = (workbook, fundingClaimFormTab) => {
  addHeadingBlack(fundingClaimFormTab, 'A1', 'C1', 'FUNDING CLAIM FORM');
  addSmallHeadingBlack(fundingClaimFormTab, 'A3', 'C3', 'Grant Holder Name:');
  addLine(fundingClaimFormTab, 'A5', 'E5');
  addSmallHeadingBlack(fundingClaimFormTab, 'A6', 'C6', 'Grant Number:');
  addLine(fundingClaimFormTab, 'A8', 'E8');
  addSFCLogo(workbook, fundingClaimFormTab);
  addBox(fundingClaimFormTab, 'G6', 'H7', 'Go to list of codes', backgroundColours.darkBlue, 16, 'center', 'FFFFFF');
  addBox(
    fundingClaimFormTab,
    'I6',
    'K7',
    'IMPORTANT: Please Keep This Document In Its Original Format. Format Not Accepted As PDF.',
    backgroundColours.darkBlue,
    11,
    'left',
    'FFFFFF',
  );
  const fundingClaimFormTable = createFundingClaimFormTable(fundingClaimFormTab);
  addRows(fundingClaimFormTable);

  fitColumnsToSize(fundingClaimFormTab, 1, 1.5);
  setColumnWidths(fundingClaimFormTab);

  addBordersToAllFilledCells(fundingClaimFormTab, 8);

  rowValue(fundingClaimFormTab, 9);

  addBox(
    fundingClaimFormTab,
    `A${rowCount + 2}`,
    `K${rowCount + 3}`,
    'IMPORTANT: Please Keep This Document In Its Original Format. Format Not Accepted As PDF.',
    backgroundColours.lightBlue,
    11,
    'center',
    'FFFFFF',
  );
};

const createFundingClaimFormTable = (fundingClaimFormTab) => {
  setTableHeadingsStyle(fundingClaimFormTab, 9, backgroundColours.lightBlue, textColours.black, [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
  ]);

  const columns = [
    { name: 'Organisation', filterButton: false },
    { name: 'ASC-WDS', filterButton: false },
    { name: 'Given Name', filterButton: false },
    { name: 'Family Name', filterButton: false },
    { name: 'Unique Learner Number (ULN)', filterButton: false },
    { name: 'Awarding Body', filterButton: false },
    { name: 'Candidate Registration Number', filterButton: false },
    { name: 'Qualification code', filterButton: false },
    { name: 'FOR DIPLOMAS ONLY Is this being claimed as part of an apprenticeship?', filterButton: false },
    { name: 'Was qualification previously funded through up-front LM incentive?', filterButton: false },
    { name: 'Value Claimed', filterButton: false },
  ];
  return fundingClaimFormTab.addTable({
    name: 'fundingClaimFormTable',
    ref: 'A9',
    columns,
    rows: [],
  });
};

const addSFCLogo = (workbook, tab) => {
  const dir = path.join(__dirname, '/logo.png');
  const logo = workbook.addImage({
    filename: dir,
    extension: 'png',
  });
  tab.addImage(logo, {
    tl: { col: 6, row: 1 },
    ext: { width: 150, height: 70 },
    hyperlinks: {
      hyperlink: 'https://www.skillsforcare.org.uk/wdfleadpartners',
      tooltip: 'https://www.skillsforcare.org.uk/wdfleadpartners',
    },
  });
};

const addRows = (fundingClaimFormTable) => {
  addBlankRowIfTableEmpty(fundingClaimFormTable, 10);
  fundingClaimFormTable.commit();
};

const setColumnWidths = (tab) => {
  const longColumn = tab.getColumn(9);
  const longColumnsecond = tab.getColumn(10);

  longColumn.width = 33;
  longColumnsecond.width = 29;
};

let rowCount = 0;
const rowValue = (tab, startingRow) => {
  tab.eachRow(function (row, rowNumber) {
    if (rowNumber > startingRow) {
      return (rowCount = rowNumber);
    }
  });
};

module.exports.generateFundingClaimFormTab = generateFundingClaimFormTab;
module.exports.addContentToFundingClaimFormTab = addContentToFundingClaimFormTab;
