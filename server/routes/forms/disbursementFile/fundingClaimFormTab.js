const generateFundingClaimFormTab = (workbook) => {
  const fundingClaimFormTab = workbook.addWorksheet('Funding Claim Form', { views: [{ showGridLines: false }] });
};

module.exports.generateFundingClaimFormTab = generateFundingClaimFormTab;
