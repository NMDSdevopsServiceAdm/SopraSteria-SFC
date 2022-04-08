const express = require('express');
const moment = require('moment');
const excelJS = require('exceljs');
const inactiveWorkplacesReport = require('../../../../reports/inactive-workplaces');

const generateReport = async (_req, res) => {
  const workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  await inactiveWorkplacesReport.generateInactiveWorkplacesReport(workbook);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-inactiveWorkplaces.xlsx',
  );

  await workbook.xlsx.write(res);

  return res.status(200).end();
};

const router = express.Router();
router.route('/').get(generateReport);

module.exports = router;
module.exports.generateReport = generateReport;
