'use strict';

const { acquireLock } = require('./lock');
const router = require('express').Router();
const s3 = require('./s3');
const { buStates } = require('./states');
const { getErrorWarningArray } = require('../../../utils/errorWarningArray');
const { EstablishmentFileHeaders } = require('../../../models/BulkImport/csv/establishments');
const { TrainingFileHeaders } = require('../../../models/BulkImport/csv/training');

const excelJS = require('exceljs');
const moment = require('moment');
const excelUtils = require('../../../utils/excelUtils');

const reportHeaders = [
  { header: 'Type', key: 'type' },
  { header: 'Workplace reference (LOCALESTID)', key: 'workplace' },
  { header: 'Staff reference (UNIQUEWORKERID)', key: 'staff' },
  { header: 'Column header', key: 'columnHeader' },
  { header: 'Line number', key: 'lineNumber' },
  { header: 'Error message', key: 'errorMessage' },
];

const WorkersFileHeaders =
  'LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DISPLAYID,FLUVAC,NINUMBER,' +
  'POSTCODE,DOB,GENDER,ETHNICITY,NATIONALITY,BRITISHCITIZENSHIP,COUNTRYOFBIRTH,YEAROFENTRY,' +
  'DISABLED,CARECERT,RECSOURCE,STARTDATE,STARTINSECT,APPRENTICE,EMPLSTATUS,ZEROHRCONT,' +
  'DAYSSICK,SALARYINT,SALARY,HOURLYRATE,MAINJOBROLE,MAINJRDESC,CONTHOURS,AVGHOURS,' +
  'OTHERJOBROLE,OTHERJRDESC,NMCREG,NURSESPEC,AMHP,SCQUAL,NONSCQUAL,QUALACH01,QUALACH01NOTES,' +
  'QUALACH02,QUALACH02NOTES,QUALACH03,QUALACH03NOTES';

let allFileHeaders = [];

const getErrorReport = async (establishmentId) => {
  const establishmentsReportURI = `${establishmentId}/validation/establishments.validation.json`;
  const workersReportURI = `${establishmentId}/validation/workers.validation.json`;
  const trainingReportURI = `${establishmentId}/validation/training.validation.json`;

  const estReportDownload = await s3.downloadContent(establishmentsReportURI);
  const wrkReportDownload = await s3.downloadContent(workersReportURI);
  const trainReportDownload = await s3.downloadContent(trainingReportURI);

  const estReport = estReportDownload && estReportDownload.data ? JSON.parse(estReportDownload.data) : [];
  const wrkReport = wrkReportDownload && wrkReportDownload.data ? JSON.parse(wrkReportDownload.data) : [];
  const trainReport = trainReportDownload && trainReportDownload.data ? JSON.parse(trainReportDownload.data) : [];

  return {
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
};

const errorReport = async (req, res) => {
  try {
    const errorReport = await getErrorReport(req.establishmentId);

    await s3.saveResponse(req, res, 200, errorReport);
  } catch (error) {
    await s3.saveResponse(req, res, 404);
    throw new Error(error);
  }
};

const createTableHeader = (currentWorksheet) => {
  const headerRow = currentWorksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };
  currentWorksheet.columns = reportHeaders;

  if (currentWorksheet.name === 'Workplace') {
    currentWorksheet.spliceColumns(3, 1);
  }
};

const generateHeaderArray = (establishmentFileHeaders, workersFileHeaders, trainingFileHeaders) => {
  allFileHeaders = allFileHeaders.concat(establishmentFileHeaders.split(','));
  allFileHeaders = allFileHeaders.concat(workersFileHeaders.split(','));
  allFileHeaders = allFileHeaders.concat(trainingFileHeaders.split(','));
};

const fillData = (WS, errorData) => {
  if (!errorData || (errorData.errors.length === 0 && errorData.warnings.length === 0)) {
    return;
  }

  errorData.errors.forEach((data) => {
    printRow(WS, data, 'ERROR');
  });
  errorData.warnings.forEach((data) => {
    printRow(WS, data, 'WARNING');
  });
};

const printRow = (WS, data, type) => {
  const text = type === 'WARNING' ? data.warning : data.error;
  data.items.forEach((item) => {
    const workerID = item.worker ? item.worker : null;
    WS.addRow({
      type,
      workplace: item.name,
      staff: workerID,
      columnHeader: data.column,
      lineNumber: item.lineNumber,
      errorMessage: text,
    });
  });
};

const generateBUReport = async (req, res) => {
  if (!req.establishmentId) {
    console.error('EstablishmentID invalid');
    return res.status(500).end();
  }

  generateHeaderArray(EstablishmentFileHeaders, WorkersFileHeaders, TrainingFileHeaders);
  const data = await getErrorReport(req.establishmentId);
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
  fillData(staffSheet, data.workers);
  fillData(trainingSheet, data.training);

  excelUtils.fitColumnsToSize(workplaceSheet);
  excelUtils.fitColumnsToSize(staffSheet);
  excelUtils.fitColumnsToSize(trainingSheet);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-bulk_upload_report.xlsx',
  );

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

router.route('/').get(acquireLock.bind(null, errorReport, buStates.DOWNLOADING, true));
router.route('/report').get(generateBUReport);

module.exports = router;
module.exports.errorReport = errorReport;
module.exports.getErrorReport = getErrorReport;
module.exports.generateBUReport = generateBUReport;
