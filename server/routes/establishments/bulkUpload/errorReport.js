'use strict';

const { acquireLock } = require('./lock');
const router = require('express').Router();
const s3 = require('./s3');
const { buStates } = require('./states');
const { getErrorWarningArray } = require('../../../utils/errorWarningArray');

const excelJS = require('exceljs');
const moment = require('moment');
// const excelUtils = require('../../../../utils/excelUtils');

const reportHeaders = [
  { header: 'Type', key: 'type' },
  { header: 'Workplace reference (LOCALESTID)', key: 'workplace' },
  { header: 'Staff reference (UNIQUEWORKERID)', key: 'staff' },
  { header: 'Column header', key: 'columnHeader' },
  { header: 'Line number', key: 'lineNumber' },
  { header: 'Error message', key: 'errorMessage' },
];

const dummyData = {
  establishments: {
    errors: [
      {
        origin: 'Establishments',
        errCode: 1280,
        errType: 'ALL_JOBS_ERROR',
        error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
        items: [{ lineNumber: 2, name: 'cotton', source: '26' }],
      },
      {
        origin: 'Establishments',
        errCode: 1105,
        errType: 'PROV_ID_ERROR',
        error: 'PROVNUM has not been supplied',
        items: [{ lineNumber: 2, name: 'cotton', source: '' }],
      },
      {
        origin: 'Establishments',
        errCode: 1110,
        errType: 'LOCATION_ID_ERROR',
        error: 'LOCATIONID has not been supplied',
        items: [{ lineNumber: 2, name: 'cotton', source: '' }],
      },
      {
        origin: 'Establishments',
        errCode: 1310,
        errType: 'STARTERS_ERROR',
        error: 'ALLJOBROLES and STARTERS do not have the same number of items (i.e. numbers and/or semi colons).',
        items: [{ lineNumber: 2, name: 'cotton', source: '1;2 - 26' }],
      },
    ],
    warnings: [
      {
        origin: 'Establishments',
        warnCode: 2320,
        warnType: 'LEAVERS_WARNING',
        warning: 'LEAVERS data you have entered does not fall within the expected range please ensure this is correct',
        items: [{ lineNumber: 2, name: 'cotton', source: '11' }],
      },
    ],
  },
  workers: { errors: [], warnings: [] },
  training: { errors: [], warnings: [] },
};

const errorReport = async (req, res) => {
  const establishmentsReportURI = `${req.establishmentId}/validation/establishments.validation.json`;
  const workersReportURI = `${req.establishmentId}/validation/workers.validation.json`;
  const trainingReportURI = `${req.establishmentId}/validation/training.validation.json`;

  try {
    const estReportDownload = await s3.downloadContent(establishmentsReportURI);
    const wrkReportDownload = await s3.downloadContent(workersReportURI);
    const trainReportDownload = await s3.downloadContent(trainingReportURI);

    const estReport = estReportDownload && estReportDownload.data ? JSON.parse(estReportDownload.data) : [];
    const wrkReport = wrkReportDownload && wrkReportDownload.data ? JSON.parse(wrkReportDownload.data) : [];
    const trainReport = trainReportDownload && trainReportDownload.data ? JSON.parse(trainReportDownload.data) : [];

    const report = {
      establishments: {
        errors: getErrorWarningArray(estReport, 'error'),
        warnings: getErrorWarningArray(estReport, 'warning'),
      },
      workers: {
        errors: getErrorWarningArray(wrkReport, 'error'),
        warnings: getErrorWarningArray(wrkReport, 'warning'),
      },
      training: {
        errors: getErrorWarningArray(trainReport, 'error'),
        warnings: getErrorWarningArray(trainReport, 'warning'),
      },
    };

    await s3.saveResponse(req, res, 200, report);
  } catch (error) {
    await s3.saveResponse(req, res, 404);
    throw new Error(error);
  }
};

const createTableHeader = (currentWorksheet) => {
  const headerRow = currentWorksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  if (currentWorksheet.name !== 'Workplace') {
    currentWorksheet.columns = reportHeaders;
    return;
  }
  const filtedArray = reportHeaders.filter(function (col) {
    return col.key !== 'staff';
  });
  currentWorksheet.columns = filtedArray;
};

const fillData = (WS, errorData) => {
  if (!errorData || (errorData.errors.length === 0 && errorData.warnings.length === 0)) {
    return;
  }

  errorData.errors.forEach((data) => {
    data.items.forEach((item) => {
      WS.addRow({
        type: 'ERROR',
        workplace: item.name,
        columnHeader: data.errType,
        lineNumber: item.lineNumber,
        errorMessage: data.error,
      });
    });
  });
};

const generateBUReport = async (req, res) => {
  // const rawData = await models.establishment.generateDeleteReportData();
  // const establishmentsData = await filterData(rawData);
  const data = dummyData;
  let workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const workplaceSheet = workbook.addWorksheet('Workplace');
  const staffSheet = workbook.addWorksheet('Staff Records');
  const trainingSheet = workbook.addWorksheet('Training');

  createTableHeader(workplaceSheet);
  createTableHeader(staffSheet);
  createTableHeader(trainingSheet);

  fillData(workplaceSheet, data.establishments);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-bulkUploadReport.xlsx',
  );

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

router.route('/').get(acquireLock.bind(null, errorReport, buStates.DOWNLOADING));
router.route('/report').post(generateBUReport);

module.exports = router;
module.exports.errorReport = errorReport;
module.exports.generateBUReport = generateBUReport;
// module.exports.filterData = filterData;
