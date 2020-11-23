const models = require('../../../../server/models');
const ExcelJS = require('exceljs');
const moment = require('moment');
const express = require('express');
const router = express.Router();

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
];
const lastColumn = String.fromCharCode('B'.charCodeAt(0) + headers.length);
const monthsWithoutUpdate = 20;

const filterData = async (rawData) => {
  const updateDate = moment().subtract(monthsWithoutUpdate, 'months');
  return rawData.filter((establishment) => {
    let workers;
    if (establishment.workers.length === 0) {
      workers = true;
    } else {
      workers = moment(establishment.workers[0].updated).isSameOrBefore(updateDate);
    }
    // console.log(workers + " --- " + moment(establishment.updated).isSameOrBefore(updateDate) );
    return moment(establishment.updated).isSameOrBefore(updateDate) && workers;
  });
};

const generateDeleteReport = async (req, res) => {
  const fullBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
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

  const formatBool = (input) => {
    return input ? 'yes' : 'no';
  };
  const createBlueHeader = () => {
    const headerFont = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFF' },
    };
    const headerStyle = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '282c84' },
    };

    WS1.mergeCells('B4:' + lastColumn + '4');
    WS1.getCell('B4').value = 'Date Run: ' + moment().format('DD/MM/YYYY');
    WS1.getCell('B4').font = headerFont;
    WS1.getCell('B4').fill = headerStyle;
    WS1.getCell('B4').border = fullBorder;

    WS1.mergeCells('B6:' + lastColumn + '6');
    WS1.getCell('B6').value = 'All establishments due to be deleted within the next four months';
    WS1.getCell('B6').font = headerFont;
    WS1.getCell('B6').fill = headerStyle;
    WS1.getCell('B6').border = fullBorder;
  };
  const createTableHeader = () => {
    const headerFont = {
      name: 'Arial',
      size: 9,
      bold: true,
    };

    let currentColumn = 'B';
    for (var i = 0; i < headers.length; i++) {
      const currentCell = WS1.getCell(currentColumn + '8');
      currentCell.value = headers[i];
      currentCell.border = fullBorder;
      currentCell.font = headerFont;
      currentCell.alignment = { vertical: 'top', horizontal: 'center' };
      currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1);
    }
  };

  const fillData = (reportData, laData) => {
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
          establishment.nmdsId,
          establishment.id,
          region,
          la,
          establishment.mainService.name,
          establishment.EmployerTypeValue,
          formatBool(establishment.isRegulated),
          parentName,
          moment(establishment.updated).add(monthsWithoutUpdate, 'months').format('DD-MM-YYYY'),
        ],
        rowStyle,
      );
      if (firstRow) {
        // format the first Row, after that exeljs can copy it
        let currentColumn = 'B';
        for (var i = 0; i < headers.length; i++) {
          const currentCell = WS1.getCell(currentColumn + '9');
          currentCell.border = fullBorder;
          currentCell.alignment = { vertical: 'top', horizontal: 'center' };
          currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1);
        }
        rowStyle = 'i+';
        firstRow = false;
      }
    });
  };

  const rawData = await models.establishment.generateDeleteReportData();
  const establishmentsData = await filterData(rawData);
  const laData = await addCSSRData(establishmentsData);

  let workbook = new ExcelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const WS1 = workbook.addWorksheet('To be deleted', { views: [{ showGridLines: false }] });

  createBlueHeader();
  createTableHeader();

  fillData(establishmentsData, laData);
  autofitColumns(WS1);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + moment().format('DD-MM-YYYY') + '-deleteReport.xlsx');

  return workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });
};

function eachColumnInRange(ws, col1, col2, cb) {
  for (let c = col1; c <= col2; c++) {
    let col = ws.getColumn(c);
    cb(col);
  }
}

function autofitColumns(ws) {
  eachColumnInRange(ws, 8, 8, (column) => {
    let maxWidth = 40;
    column.eachCell((cell) => {
      if (!cell.isMerged && cell.value) {
        // doesn't handle merged cells

        let text = '';
        if (typeof cell.value != 'object') {
          // string, number, ...
          text = cell.value.toString();
        } else if (cell.value.richText) {
          // richText
          text = cell.value.richText.reduce((text, obj) => text + obj.text.toString(), '');
        }

        // handle new lines -> don't forget to set wrapText: true
        let values = text.split(/[\n\r]+/);

        for (let value of values) {
          let width = value.length;

          if (cell.font && cell.font.bold) {
            width *= 1.08; // bolding increases width
          }

          maxWidth = Math.max(maxWidth, width);
        }
      }
    });

    maxWidth += 0.71; // compensate for observed reduction
    maxWidth += 1; // buffer space

    column.width = maxWidth;
  });
  ws.getColumn(1).width = 0.7;
}

module.exports = router;
module.exports.generateDeleteReport = generateDeleteReport;
module.exports.filterData = filterData;
module.exports.monthsWithoutUpdate = monthsWithoutUpdate;
