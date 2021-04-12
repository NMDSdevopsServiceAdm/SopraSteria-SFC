const excelJS = require('exceljs');
const moment = require('moment');
const express = require('express');
const router = express.Router();

const generateSatisfactionSurveyReport = async (req, res) => {
  let workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-satisfactionSurveyReport.xlsx',
  );

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

module.exports = router;
module.exports.generateSatisfactionSurveyReport = generateSatisfactionSurveyReport;
