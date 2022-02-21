const excelJS = require('exceljs');

const { generateFundingClaimFormTab } = require('./fundingClaimFormTab');

const generateFundingClaimForm = async () => {
  try {
    const workbook = new excelJS.Workbook();

    workbook.creator = 'Skills-For-Care';
    workbook.properties.date1904 = true;

    generateFundingClaimFormTab(workbook);

    await workbook.xlsx.writeFile('fundingForm.xls');
  } catch (error) {
    console.error(error);
  }
};

module.exports.generateFundingClaimForm = generateFundingClaimForm;
