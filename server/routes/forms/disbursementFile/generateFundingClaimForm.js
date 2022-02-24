const excelJS = require('exceljs');
const uploadFileToS3 = require('./uploadToS3');

const { generateFundingClaimFormTab } = require('./fundingClaimFormTab');

const generateFundingClaimForm = async () => {
  try {
    const workbook = new excelJS.Workbook();

    workbook.creator = 'Skills-For-Care';
    workbook.properties.date1904 = true;

    generateFundingClaimFormTab(workbook);

    const buffer = await workbook.xlsx.writeBuffer();
    await uploadFileToS3(buffer);
    await workbook.xlsx.writeFile('fundingForm.xls');
  } catch (error) {
    console.error(error);
  }
};

module.exports.generateFundingClaimForm = generateFundingClaimForm;
