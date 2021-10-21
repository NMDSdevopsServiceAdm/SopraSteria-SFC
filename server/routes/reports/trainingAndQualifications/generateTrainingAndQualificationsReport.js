const excelJS = require('exceljs');
const express = require('express');
const router = express.Router({ mergeParams: true });
const moment = require('moment');
const { generateHowToTab } = require('./howToTab');
const { generateSummaryTab } = require('./summaryTab');
const { generateTrainingTab } = require('./trainingTab');
const { generateQualificationsTab } = require('./qualificationsTab');
const { generateCareCertificateTab } = require('./careCertificateTab');
const models = require('../../../models');

const generateTrainingAndQualificationsReport = async (req, res) => {
  try {
    const workbook = new excelJS.Workbook();

    const establishment = await models.establishment.findByUid(req.params.id);

    workbook.creator = 'Skills-For-Care';
    workbook.properties.date1904 = true;

    generateHowToTab(workbook);
    await generateSummaryTab(workbook, establishment.id);
    await generateTrainingTab(workbook, establishment.id);
    await generateQualificationsTab(workbook, establishment.id);
    await generateCareCertificateTab(workbook, establishment.id);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + moment().format('DD-MM-YYYY') + '-SFC-Training-Report.xlsx',
    );

    await workbook.xlsx.write(res);
    return res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500);
  }
};

router.route('/:id/report').get(generateTrainingAndQualificationsReport);

module.exports = router;
module.exports.generateTrainingAndQualificationsReport = generateTrainingAndQualificationsReport;
