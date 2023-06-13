const models = require('../../../../server/models');
const excelJS = require('exceljs');
const dayjs = require('dayjs');
const express = require('express');
const router = express.Router();

const excelUtils = require('../../../utils/excelUtils');
const concatenateAddress = require('../../../utils/concatenateAddress').concatenateAddress;

const headers = [
  'Establishment Name',
  'Address',
  'Postcode',
  'NMDS ID',
  'Establishment ID',
  'Region',
  'LA area',
  'Main Service Type',
  'Establishment Type',
  'CQC Registered',
  'Parent Name',
  'Due to be deleted date',
  'Data Owner',
];
const lastColumn = String.fromCharCode('B'.charCodeAt(0) + headers.length);
const monthsWithoutUpdate = 20;
const monthsToBeDelete = 24;

const createBlueHeader = (WS1) => {
  const headerFont = {
    name: 'Arial',
    size: 10,
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  WS1.mergeCells('B4:' + lastColumn + '4');
  WS1.getCell('B4').value = 'Date Run: ' + dayjs().format('DD/MM/YYYY');
  WS1.getCell('B4').font = headerFont;
  WS1.getCell('B4').fill = excelUtils.blueBackground;
  WS1.getCell('B4').border = excelUtils.fullBorder;

  WS1.mergeCells('B6:' + lastColumn + '6');
  WS1.getCell('B6').value = 'All establishments due to be deleted within the next four months';
  WS1.getCell('B6').font = headerFont;
  WS1.getCell('B6').fill = excelUtils.blueBackground;
  WS1.getCell('B6').border = excelUtils.fullBorder;
};
const createTableHeader = (WS1) => {
  const headerFont = {
    name: 'Arial',
    size: 9,
    bold: true,
  };

  let currentColumn = 'B';
  for (var i = 0; i < headers.length; i++) {
    const currentCell = WS1.getCell(currentColumn + '8');
    currentCell.value = headers[i];
    currentCell.border = excelUtils.fullBorder;
    currentCell.font = headerFont;
    currentCell.alignment = { vertical: 'top', horizontal: 'center' };
    currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1);
  }
};
const addCSSRData = async (establishmentsData) => {
  const result = {};
  await Promise.all(
    establishmentsData.map(async (establishment) => {
      result[establishment.id] = await models.pcodedata.getCssrFromPostcode(establishment.postcode);
    }),
  );
  return result;
};

const fillData = (reportData, laData, WS1) => {
  let firstRow = true;
  let rowStyle = '';
  if (!reportData || reportData.length === 0) {
    return;
  }

  reportData.forEach((establishment) => {
    const parentName = establishment.Parent ? establishment.Parent.NameValue : '';
    let region = '';
    let la = '';
    if (laData[establishment.id] && laData[establishment.id].theAuthority) {
      region = laData[establishment.id].theAuthority.region;
      la = laData[establishment.id].theAuthority.localAuthority;
    }
    const address = concatenateAddress(
      establishment.address,
      establishment.address2,
      establishment.address3,
      establishment.town,
      establishment.county,
    );
    WS1.addRow(
      [
        '',
        establishment.NameValue,
        address,
        establishment.postcode,
        establishment.nmdsId.trim(),
        establishment.id,
        region,
        la,
        establishment.mainService.name,
        establishment.EmployerTypeValue,
        excelUtils.formatBool(establishment.isRegulated),
        parentName,
        new Date(dayjs(establishment.LastActivity.lastUpdated).add(monthsToBeDelete, 'months').format('MM-DD-YYYY')),
        establishment.LastActivity.dataOwner,
      ],
      rowStyle,
    );
    if (firstRow) {
      // format the first Row, after that exeljs can copy it
      let currentColumn = 'B';
      for (let i = 0; i < headers.length; i++) {
        const currentCell = WS1.getCell(currentColumn + '9');
        currentCell.border = excelUtils.fullBorder;
        currentCell.alignment = { vertical: 'top', horizontal: 'center' };
        currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1);
      }
      rowStyle = 'i+';
      firstRow = false;
    }
  });
};

const generateDeleteReport = async (req, res) => {
  const lastUpdatedDate = dayjs().subtract(monthsWithoutUpdate, 'months').toDate();
  const reportData = await models.establishment.generateDeleteReportData(lastUpdatedDate);
  const laData = await addCSSRData(reportData);

  let workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const WS1 = workbook.addWorksheet('To be deleted', { views: [{ showGridLines: false }] });

  createBlueHeader(WS1);
  createTableHeader(WS1);

  fillData(reportData, laData, WS1);
  excelUtils.autoFitColumns(WS1, 8);
  WS1.getColumn(1).width = 0.7;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + dayjs().format('DD-MM-YYYY') + '-deleteReport.xlsx');

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

module.exports = router;
module.exports.generateDeleteReport = generateDeleteReport;
module.exports.monthsWithoutUpdate = monthsWithoutUpdate;
