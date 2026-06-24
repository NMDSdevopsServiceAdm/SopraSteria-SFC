const excelJS = require('exceljs');
const express = require('express');
const router = express.Router({ mergeParams: true });
const moment = require('moment');

const models = require('../../../models');
const Authorization = require('../../../utils/security/isAuthenticated');
const { hasPermission } = require('../../../utils/security/hasPermission');

const { generateSummaryTab } = require('./standaloneSummaryTab');
const { generateCareCertificateTab } = require('./careCertificateTab');
const { generateIntroTab } = require('./introTab');
const { generateTrainingByStaffTab } = require('./trainingByStaffTab');
const { generateTrainingByCategoryTab } = require('./trainingByCategoryTab');
const {
  buildWorkerTrainingBreakdown,
  buildTrainingCategorySummary,
  convertTrainingForEstablishments,
  listAllExistingAndMissingTrainings,
  convertWorkersWithCareCertificateStatus,
  buildWorkplaceSummaryData,
} = require('../../../utils/trainingAndQualificationsUtils');

const { generateExpiredTrainingTab } = require('./expiredTrainingTab');
const { generateTrainingRecordDetailsTab } = require('./trainingRecordDetailsTab');
const { generateQualificationRecordDetailsTab } = require('./qualificationRecordDetailsTab');
const { getRawDataForTrainingAndQualificationsReport } = require('./getRawData');

const generateTrainingAndQualificationsReport = async (req, res) => {
  try {
    console.log('start generating report');

    const workbook = new excelJS.Workbook();

    const establishment = await models.establishment.findByUid(req.params.id);
    const rawData = await getRawDataForTrainingAndQualificationsReport(establishment.id, false);

    workbook.creator = 'Skills-For-Care';
    workbook.properties.date1904 = true;

    console.log('start generating report for generateIntroTab');
    await generateIntroTab(workbook, establishment);

    const careCertificateStatus = convertWorkersWithCareCertificateStatus(
      rawData.rawEstablishmentCareCertificateStatus,
    );
    const workerTrainingBreakdowns = await buildWorkerTrainingBreakdown(rawData.rawEstablishmentTrainingBreakdowns);
    const { workplacesData } = buildWorkplaceSummaryData(
      workerTrainingBreakdowns,
      rawData.rawEstablishmentCareCertificateStatus,
    );
    console.log('start generating report for generateSummaryTab');
    await generateSummaryTab(workbook, workplacesData[0]);

    console.log('start generating report for generateTrainingByStaffTab');
    await generateTrainingByStaffTab(workbook, workerTrainingBreakdowns);

    const establishmentWithTrainingRecords = convertTrainingForEstablishments(
      rawData.rawEstablishmentWithTrainingRecords,
    );
    const allTrainingRecordsAndMissingTrainings = listAllExistingAndMissingTrainings(establishmentWithTrainingRecords);
    const trainingByCategoryBreakdowns = buildTrainingCategorySummary(establishmentWithTrainingRecords, false);

    console.log('start generating report for generateTrainingByCategoryTab');
    await generateTrainingByCategoryTab(workbook, trainingByCategoryBreakdowns);
    console.log('start generating report for generateExpiredTrainingTab');
    await generateExpiredTrainingTab(workbook, allTrainingRecordsAndMissingTrainings);

    console.log('start generating report for generateTrainingRecordDetailsTab');
    await generateTrainingRecordDetailsTab(workbook, allTrainingRecordsAndMissingTrainings);

    console.log('start generating report for generateCareCertificateTab');
    await generateCareCertificateTab(workbook, careCertificateStatus);

    console.log('start generating report for generateQualificationRecordDetailsTab');
    await generateQualificationRecordDetailsTab(workbook, establishment.id);

    console.log('start generating report finished');
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
