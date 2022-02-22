const {
  addHeadingBlack,
  addSmallHeadingBlack,
  addLine,
  setTableHeadingsStyle,
  backgroundColours,
  textColours,
  fitColumnsToSize,
  alignColumnToLeft,
} = require('../../../utils/excelUtils');
const path = require('path');

const generateFundingClaimFormTab = (workbook) => {
  const fundingClaimFormTab = workbook.addWorksheet('Funding Claim Form', { views: [{ showGridLines: false }] });
  addContentToFundingClaimFormTab(workbook, fundingClaimFormTab);
};
const addContentToFundingClaimFormTab = (workbook, fundingClaimFormTab) => {
  addHeadingBlack(fundingClaimFormTab, 'A1', 'C1', 'FUNDING CLAIM FORM');
  addSmallHeadingBlack(fundingClaimFormTab, 'A3', 'C3', 'Grant Holder Name:');
  addLine(fundingClaimFormTab, 'A5', 'H5');
  addSmallHeadingBlack(fundingClaimFormTab, 'A6', 'C6', 'Grant Number:');
  addLine(fundingClaimFormTab, 'A8', 'H8');
  addSFCLogo(workbook, fundingClaimFormTab);
  fundingClaimFormTable(fundingClaimFormTab);
  fitColumnsToSize(fundingClaimFormTab, 1, 5.5);
  alignColumnToLeft(fundingClaimFormTab, 1);
};

const fundingClaimFormTable = (fundingClaimFormTab) => {
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
    { name: 'Organisation', filterButton: true },
    { name: 'ASC-WDS', filterButton: true },
    { name: 'Given Name', filterButton: true },
    { name: 'Family Name', filterButton: true },
    { name: 'Unique Learner Number (ULN)', filterButton: true },
    { name: 'Awarding Body', filterButton: true },
    { name: 'Candidate Registration Number', filterButton: true },
    { name: 'Qualification code', filterButton: true },
    { name: 'FOR DIPLOMAS ONLY Is this being claimed as part of an apprenticeship?', filterButton: true },
    { name: 'Was qualification previously funded through up-front LM incentive?', filterButton: true },
    { name: 'Value Claimed', filterButton: true },
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
    tl: { col: 15, row: 1 },
    ext: { width: 200, height: 100 },
    hyperlinks: {
      hyperlink: 'https://www.skillsforcare.org.uk/wdfleadpartners',
      tooltip: 'https://www.skillsforcare.org.uk/wdfleadpartners',
    },
  });
};

module.exports.generateFundingClaimFormTab = generateFundingClaimFormTab;
module.exports.addContentToFundingClaimFormTab = addContentToFundingClaimFormTab;
