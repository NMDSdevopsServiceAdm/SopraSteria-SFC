const excelJS = require('exceljs');
const express = require('express');
const moment = require('moment');

const generateReport = async (_, res) => {
  let workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const worksheet = workbook.addWorksheet('Inactive workplaces');
  worksheet.columns = ['Workplace name', 'Workplace ID', 'Date last updated', 'Email template', 'Data owner', 'Name of user', 'User email'];
  worksheet.getRow(1).font = { bold: true, name: 'Calibri' };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + moment().format('DD-MM-YYYY') + '-inactiveWorkplaces.xlsx');

  await workbook.xlsx.write(res);
  return res.status(200).end();
}

const router = express.Router();
router.route('/').get(generateReport);

module.exports = router;
module.exports.generateReport = generateReport;
