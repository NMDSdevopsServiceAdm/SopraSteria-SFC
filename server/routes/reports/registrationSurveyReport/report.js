const excelJS = require('exceljs');
const express = require('express');
const moment = require('moment');
const get = require('lodash/get');
const excelUtils = require('../../../utils/excelUtils');
const models = require('../../../models');

const printRow = (worksheet, item) => {
  worksheet.addRow({
    workplaceId: get(item, 'user.establishment.nmdsId'),
    whyCreateAccount: item.whyDidYouCreateAccount,
    howDidYouHearAboutASCWDS: item.howDidYouHearAboutASCWDS,
    dateCompleted: moment(item.submittedDate).format('DD-MM-YYYY'),
  });
};

const generateReport = async (_, res) => {
  const workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const worksheet = workbook.addWorksheet('Registration survey');
  worksheet.columns = [
    { header: 'Workplace ID', key: 'workplaceId' },
    { header: 'Why did you create your account?', key: 'whyCreateAccount' },
    { header: 'How did you hear about ASC-WDS?', key: 'howDidYouHearAboutASCWDS' },
    { header: 'Date completed', key: 'dateCompleted' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  const registrationSurveyResponses = await models.registrationSurvey.findAll({
    include: [
      {
        model: models.user,
        as: 'user',
        attributes: ['id'],
        include: [
          {
            model: models.establishment,
            attributes: ['nmdsId'],
          },
        ],
      },
    ],
  });
  registrationSurveyResponses.forEach((response) => {
    printRow(worksheet, response);
  });

  excelUtils.fitColumnsToSize(worksheet);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-registration-survey-report.xlsx',
  );

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

const router = express.Router();
router.route('/').get(generateReport);

module.exports = router;
module.exports.generateReport = generateReport;
