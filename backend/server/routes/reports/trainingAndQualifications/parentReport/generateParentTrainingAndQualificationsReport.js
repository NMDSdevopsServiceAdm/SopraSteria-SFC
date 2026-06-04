const excelJS = require('exceljs');
const express = require('express');
const router = express.Router({ mergeParams: true });
const moment = require('moment');

const Authorization = require('../../../../utils/security/isAuthenticated');
const { hasPermission } = require('../../../../utils/security/hasPermission');

const { generateParentSummaryTab } = require('./parentSummaryTab');
const { generateCareCertificateTab } = require('../careCertificateTab');
const models = require('../../../../models');
const { generateIntroTab } = require('../introTab');
const { generateTrainingRecordDetailsTab } = require('../trainingRecordDetailsTab');
const { generateExpiredTrainingTab } = require('../expiredTrainingTab');
const { generateTrainingByStaffTab } = require('../trainingByStaffTab');
const { generateTrainingByCategoryTab } = require('../trainingByCategoryTab');
const {
  convertTrainingForEstablishments,
  listAllExistingAndMissingTrainings,
  convertWorkersWithCareCertificateStatus,
  buildWorkerTrainingBreakdown,
  buildWorkplaceSummaryData,
  buildTrainingCategorySummary,
} = require('../../../../utils/trainingAndQualificationsUtils');
const { generateQualificationRecordDetailsTab } = require('../qualificationRecordDetailsTab');
const { getRawDataForTrainingAndQualificationsReport } = require('../getRawData');

const generateParentTrainingAndQualificationsReport = async (req, res) => {
  try {
    const workbook = new excelJS.Workbook();

    const establishment = await models.establishment.findByUid(req.params.id);

    workbook.creator = 'Skills-For-Care';
    workbook.properties.date1904 = true;

    const rawData = await getRawDataForTrainingAndQualificationsReport(establishment.id, true);

    const careCertificateStatus = convertWorkersWithCareCertificateStatus(
      rawData.rawEstablishmentCareCertificateStatus,
    );

    const workerTrainingBreakdowns = await buildWorkerTrainingBreakdown(rawData.rawEstablishmentTrainingBreakdowns);
    const summaryTabData = buildWorkplaceSummaryData(
      workerTrainingBreakdowns,
      rawData.rawEstablishmentCareCertificateStatus,
    );

    generateIntroTab(workbook, establishment);
    await generateParentSummaryTab(workbook, establishment, summaryTabData);

    const rawEstablishmentWithTrainingRecords = await models.establishment.getEstablishmentTrainingRecords(
      establishment.id,
      true,
    );
    const establishmentWithTrainingRecords = convertTrainingForEstablishments(rawEstablishmentWithTrainingRecords);
    const allTrainingRecordsAndMissingTrainings = listAllExistingAndMissingTrainings(establishmentWithTrainingRecords);

    const trainingByCategoryBreakdowns = buildTrainingCategorySummary(establishmentWithTrainingRecords);

    await generateTrainingByStaffTab(workbook, workerTrainingBreakdowns, true);
    await generateTrainingByCategoryTab(workbook, trainingByCategoryBreakdowns, true);

    await generateExpiredTrainingTab(workbook, allTrainingRecordsAndMissingTrainings, true);
    await generateTrainingRecordDetailsTab(workbook, allTrainingRecordsAndMissingTrainings, true);

    await generateQualificationRecordDetailsTab(workbook, establishment.id, true);
    await generateCareCertificateTab(workbook, careCertificateStatus, true);

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

router
  .route('/:id/report')
  .get(
    Authorization.hasAuthorisedEstablishment,
    hasPermission('canViewEstablishment'),
    generateParentTrainingAndQualificationsReport,
  );

module.exports = router;
module.exports.generateParentTrainingAndQualificationsReport = generateParentTrainingAndQualificationsReport;
