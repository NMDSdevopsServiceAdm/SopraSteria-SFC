const models = require('../../../../server/models');
const ExcelJS = require('exceljs');
const moment = require('moment');
const express = require('express');
const router = express.Router();

const headers = [
  'Establishment Name',
  'Address',
  'Postcode',
  'NMDS ID',
  'Telephone',
  'Establishment ID',
  'Region',
  'LA area',
  'Main Service Type',
  'Establishment Type',
  'CQC Registered',
  'Parent Name',
  'Due to be deleted date',
];

const generateDeleteReport = async (req, res) => {
  console.log('generateDeleteReport');
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

    //  creating headers
    WS1.mergeCells('B4:N4');
    WS1.getCell('B4').value = 'Date Run: ' + moment().format('DD/MM/YYYY');
    WS1.getCell('B4').font = headerFont;
    WS1.getCell('B4').fill = headerStyle;
    WS1.getCell('B4').border = fullBorder;

    // WS1.getRow(4).commit();

    WS1.mergeCells('B6:N6');
    WS1.getCell('B6').value = 'All establishments due to be deleted within the next four months';
    WS1.getCell('B6').font = headerFont;
    WS1.getCell('B6').fill = headerStyle;
    WS1.getCell('B6').border = fullBorder;
    //WS1.getRow(6).commit();
  };
  const createTableHeader = () => {
    const headerFont = {
      name: 'Arial',
      size: 9,
      bold: true,
    };

    let currentColumn = 'B';
    for (var i = 0; i < 13; i++) {
      const currentCell = WS1.getCell(currentColumn + '8');
      currentCell.value = headers[i];
      currentCell.border = fullBorder;
      currentCell.font = headerFont;
      currentCell.alignment = { vertical: 'top', horizontal: 'center' };
      currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1);
    }
  };

  const fillData = () => {
    let row = 9;
    let rowStyle = '';
    reportData.forEach((establishment) => {
      WS1.addRow(
        [
          '',
          establishment.nameOrId,
          establishment.address,
          establishment.postcode,
          establishment.nmdsid,
          '',
          establishment.establishmentId,
        ],
        rowStyle,
      );
      if (row === 9) {
        // format the first Row, after that exeljs can copy it
        let currentColumn = 'B';
        for (var i = 0; i < 13; i++) {
          const currentCell = WS1.getCell(currentColumn + '8');
          currentCell.border = fullBorder;
          currentCell.alignment = { vertical: 'top', horizontal: 'center' };
          currentColumn = String.fromCharCode(currentColumn.charCodeAt(0) + 1);
        }
        rowStyle = 'i';
      }
    });
  };

  const reportData = await models.establishment.deleteReportData;
  console.log('REPORTDATA');

  console.log(JSON.stringify(reportData));
  // const options = {
  //   filename: './streamed-workbook.xlsx',
  //   useStyles: true,
  //   useSharedStrings: true
  // };
  //const workbook = new Excel.stream.xlsx.WorkbookWriter(options);
  let workbook = new ExcelJS.Workbook();

  const fullBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const WS1 = workbook.addWorksheet('To be deleted', { views: [{ showGridLines: false }] });

  createBlueHeader();
  createTableHeader();

  fillData();
  //WS1.commit();
  autofitColumns(WS1);
  WS1.getColumn(1).width = 0.7;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + 'tutorials.xlsx');
  //workbook.commit();

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
  eachColumnInRange(ws, 1, ws.columnCount, (column) => {
    let maxWidth = 10;
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
}
module.exports = router;
module.exports.generateDeleteReport = generateDeleteReport;
