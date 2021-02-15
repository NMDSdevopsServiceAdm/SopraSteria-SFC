const excelJS = require('exceljs');
const express = require('express');
const moment = require('moment');
const excelUtils = require('../../../../utils/excelUtils');

const generateReport = async (_, res) => {
  const workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const worksheet = workbook.addWorksheet('Inactive workplaces');
  worksheet.columns = [
    { header: 'Workplace name' },
    { header: 'Workplace ID' },
    { header: 'Date last updated' },
    { header: 'Email template' },
    { header: 'Data owner' },
    { header: 'Name of user' },
    { header: 'User email' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  excelUtils.fitColumnsToSize(worksheet);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + moment().format('DD-MM-YYYY') + '-inactiveWorkplaces.xlsx');

  await workbook.xlsx.write(res);
  return res.status(200).end();
}

const router = express.Router();
router.route('/').get(generateReport);

module.exports = router;
module.exports.generateReport = generateReport;
