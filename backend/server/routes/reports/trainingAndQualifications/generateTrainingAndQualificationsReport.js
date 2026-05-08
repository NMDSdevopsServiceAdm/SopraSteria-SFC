const excelJS = require('exceljs');
const express = require('express');
const router = express.Router({ mergeParams: true });
const moment = require('moment');

const models = require('../../../models');
const Authorization = require('../../../utils/security/isAuthenticated');
const { hasPermission } = require('../../../utils/security/hasPermission');

const { generateSummaryTab } = require('./summaryTab');
const { generateTrainingTab } = require('./trainingTab');
const { generateQualificationsTab } = require('./qualificationsTab');
const { generateCareCertificateTab } = require('./careCertificateTab');
const { generateIntroTab } = require('./introTab');
const { generateTrainingByStaffTab } = require('./trainingByStaffTab');
const { generateTrainingByCategoryTab } = require('./trainingByCategoryTab');
const {
  buildWorkerTrainingBreakdownWithWorkplaceInfo,
  buildTrainingByCategoryBreakdown,
} = require('../../../utils/trainingAndQualificationsUtils');

const generateTrainingAndQualificationsReport = async (req, res) => {
  try {
    const workbook = new excelJS.Workbook();

    const establishment = await models.establishment.findByUid(req.params.id);

    workbook.creator = 'Skills-For-Care';
    workbook.properties.date1904 = true;

    await generateIntroTab(workbook, establishment);

    const rawEstablishmentTrainingBreakdowns = await models.establishment.workersAndTraining(establishment.id, true);
    const rawEstablishmentTrainingByCategoryBreakdowns = await models.establishment.getEstablishmentTrainingRecords(
      establishment.id,
      true,
    );

    const workerTrainingBreakdowns = await buildWorkerTrainingBreakdownWithWorkplaceInfo(
      rawEstablishmentTrainingBreakdowns,
    );

    const trainingByCategoryBreakdowns = buildTrainingByCategoryBreakdown(rawEstablishmentTrainingByCategoryBreakdowns);

    await generateTrainingByStaffTab(workbook, workerTrainingBreakdowns);
    await generateTrainingByCategoryTab(workbook, trainingByCategoryBreakdowns);

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
    return res.status(500).send();
  }
};

router
  .route('/:id/report')
  .get(
    Authorization.hasAuthorisedEstablishment,
    hasPermission('canViewEstablishment'),
    generateTrainingAndQualificationsReport,
  );

module.exports = router;
module.exports.generateTrainingAndQualificationsReport = generateTrainingAndQualificationsReport;
