const { addHeadingBlack, addSmallHeadingBlack, addLine } = require('../../../utils/excelUtils');
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
