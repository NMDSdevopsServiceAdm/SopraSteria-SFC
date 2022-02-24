const excelJS = require('exceljs');
const express = require('express');
const router = express.Router({ mergeParams: true });
const uploadFileToS3 = require('./uploadToS3');

const { generateFundingClaimFormTab } = require('./fundingClaimFormTab');

const generateFundingClaimForm = async (req, res) => {
  try {
    const workbook = new excelJS.Workbook();

    workbook.creator = 'Skills-For-Care';
    workbook.properties.date1904 = true;

    generateFundingClaimFormTab(workbook);

    const buffer = await workbook.xlsx.writeBuffer();
    await uploadFileToS3(buffer);
    await workbook.xlsx.writeFile('fundingForm.xls');
    return res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};
router.route('/').post(generateFundingClaimForm);

module.exports = router;
module.exports.generateFundingClaimForm = generateFundingClaimForm;
