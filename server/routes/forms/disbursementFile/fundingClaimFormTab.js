const { addHeadingBlack, addSmallHeadingBlack, addLine } = require('../../../utils/excelUtils');

const generateFundingClaimFormTab = (workbook) => {
  const fundingClaimFormTab = workbook.addWorksheet('Funding Claim Form', { views: [{ showGridLines: false }] });
  addContentToFundingClaimFormTab(fundingClaimFormTab);
};
const addContentToFundingClaimFormTab = (fundingClaimFormTab) => {
  addHeadingBlack(fundingClaimFormTab, 'A1', 'C1', 'FUNDING CLAIM FORM');
  addSmallHeadingBlack(fundingClaimFormTab, 'A3', 'C3', 'Grant Holder Name:');
  addLine(fundingClaimFormTab, 'A5', 'H5');
  addSmallHeadingBlack(fundingClaimFormTab, 'A6', 'C6', 'Grant Number:');
  addLine(fundingClaimFormTab, 'A8', 'H8');
};

module.exports.generateFundingClaimFormTab = generateFundingClaimFormTab;
