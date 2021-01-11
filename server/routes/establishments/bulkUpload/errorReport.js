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

// const filterData = async (rawData) => {
// };

const createTableHeader = (currentWorksheet) => {
  // const headerFont = {
  //   name: 'Arial',
  //   size: 11,
  //   bold: true,
  // };
  if (currentWorksheet.name !== 'Workplace') {
    currentWorksheet.columns = reportHeaders;
    return;
  }
  const filtedArray = reportHeaders.filter(function (col) {
    return col.key !== 'staff';
  });
  currentWorksheet.columns = filtedArray;
};

// const fillData = (reportData, laData, WS1) => {
//   let firstRow = true;
//   let rowStyle = '';
//   if (!reportData || reportData.length === 0) {
//     return;
//   }

//   reportData.forEach((establishment) => {
//     const parentName = establishment.Parent ? establishment.Parent.NameValue : '';
//     let region = '';
//     let la = '';
//     if (laData[establishment.id] && laData[establishment.id].theAuthority) {
//       region = laData[establishment.id].theAuthority.region;
//       la = laData[establishment.id].theAuthority.localAuthority;
//     }

//     const address = concatenateAddress(
//       establishment.address,
//       establishment.address2,
//       establishment.address3,
//       establishment.town,
//       establishment.county,
//     );
//     WS1.addRow(
//       [
//         '',
//         establishment.NameValue,
//         address,
//         establishment.postcode,
//         establishment.nmdsId.trim(),
//         establishment.id,
//         region,
//         la,
//         establishment.mainService.name,
//         establishment.EmployerTypeValue,
//         excelUtils.formatBool(establishment.isRegulated),
//         parentName,
//         new Date(moment(getLastUpdate(establishment)).add(monthsToBeDelete, 'months').format('MM-DD-YYYY')),
//       ],
//       rowStyle,
//     );
//     if (firstRow) {
//       // format the first Row, after that exeljs can copy it
//       let currentColumn = 'B';
//       for (let i = 0; i < headers.length; i++) {
//         const currentCell = WS1.getCell(currentColumn + '9');
//         currentCell.border = excelUtils.fullBorder;
//         currentCell.alignment = { vertical: 'top', horizontal: 'center' };
//         currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1);
//       }
//       rowStyle = 'i+';
//       firstRow = false;
//     }
//   });
// };

const generateBUReport = async (req, res) => {
  // const rawData = await models.establishment.generateDeleteReportData();
  // const establishmentsData = await filterData(rawData);

  let workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const workplaceSheet = workbook.addWorksheet('Workplace');
  const staffSheet = workbook.addWorksheet('Staff Records');
  const trainingSheet = workbook.addWorksheet('Training');

  createTableHeader(workplaceSheet);
  createTableHeader(staffSheet);
  createTableHeader(trainingSheet);

  // fillData(establishmentsData, laData, WS1);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-bulkUploadReport.xlsx',
  );

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

router.route('/').get(acquireLock.bind(null, errorReport, buStates.DOWNLOADING));
router.route('/report').get(generateBUReport);

module.exports = router;
module.exports.errorReport = errorReport;
module.exports.generateBUReport = generateBUReport;
// module.exports.filterData = filterData;
