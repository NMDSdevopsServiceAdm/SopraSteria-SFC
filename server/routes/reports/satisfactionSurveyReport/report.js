const models = require('../../../../server/models');

const excelJS = require('exceljs');
const excelUtils = require('../../../utils/excelUtils');
const moment = require('moment');
const express = require('express');
const router = express.Router();

const printRow = (worksheet, result) => {
  worksheet.addRow({
    fullName: result.user ? result.user.FullNameValue : '',
    email: result.user ? result.user.EmailValue : '',
    workplaceID: result.establishment ? result.establishment.nmdsId : '',
    submittedDate: moment(result.submittedDate).format('DD-MM-YYYY'),
    didYouDoEverything: result.didYouDoEverything,
    didYouDoEverythingAdditionalAnswer: result.didYouDoEverythingAdditionalAnswer,
    howDidYouFeel: result.howDidYouFeel,
  });
};

const generateSatisfactionSurveyReport = async (_req, res) => {
  const reportData = await models.satisfactionSurvey.generateSatisfactionSurveyReportData();
  let workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const worksheet = workbook.addWorksheet('Satisfaction Survey');
  worksheet.columns = [
    { header: 'Name', key: 'fullName' },
    { header: 'Email Address', key: 'email' },
    { header: 'Submitted Date', key: 'submittedDate' },
    { header: 'Workplace ID', key: 'workplaceID' },
    { header: 'Did you everything?', key: 'didYouDoEverything' },
    { header: 'Additional Answer', key: 'didYouDoEverythingAdditionalAnswer' },
    { header: 'How did you feel?', key: 'howDidYouFeel' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  reportData.forEach((response) => {
    printRow(worksheet, response);
  });

  excelUtils.fitColumnsToSize(worksheet);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-satisfaction-survey-report.xlsx',
  );

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

module.exports = router;
module.exports.generateSatisfactionSurveyReport = generateSatisfactionSurveyReport;
