const excelJS = require('exceljs');
const express = require('express');
const router = express.Router({ mergeParams: true });
const moment = require('moment');
const { generateHowToTab } = require('../howToTab');
const { generateSummaryTab } = require('./parentSummaryTab');
const { generateTrainingTab } = require('../trainingTab');
const models = require('../../../../models');

const generateParentTrainingAndQualificationsReport = async (req, res) => {
  try {
    const workbook = new excelJS.Workbook();

    const establishment = await models.establishment.findByUid(req.params.id);

    workbook.creator = 'Skills-For-Care';
    workbook.properties.date1904 = true;

    generateHowToTab(workbook, true);
    await generateSummaryTab(workbook, establishment.id);
    await generateTrainingTab(workbook, establishment.id, true);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + moment().format('DD-MM-YYYY') + '-SFC-Parent-Training-Report.xlsx',
    );

    await workbook.xlsx.write(res);
    return res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500);
  }
};

router.route('/:id/report').get(generateParentTrainingAndQualificationsReport);

module.exports = router;
module.exports.generateParentTrainingAndQualificationsReport = generateParentTrainingAndQualificationsReport;
