/* eslint-disable no-unused-vars */
const excelJS = require('exceljs');
const express = require('express');
const router = express.Router({ mergeParams: true });
const moment = require('moment');
const excelUtils = require('../../../utils/excelUtils');

const generateTrainingAndQualificationsReport = async (_, res) => {
  const workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  generateHowToTab(workbook);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-training-report.xlsx',
  );

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

const generateHowToTab = (workbook) => {
  const howToTab = workbook.addWorksheet('How to...', { views: [{ showGridLines: false }] });

  howToTab.getColumn(1).width = 4;
  howToTab.getColumn(12).width = 4;

  setColourBars(howToTab);

  addHeading(howToTab, 'B5', 'K5', 'Training and qualifications report');
  addLine(howToTab, 'A7', 'L7');
  addHeading(howToTab, 'B9', 'K9', 'How to sort and filter the table columns');

  const filteringInstructions =
    'Click on the arrow in the header of the column you want to sort or filter. In the menu displayed, you can sort the data to suit your needs (for example, you can sort it alphabetically). The menu also lets you select what you want to view by filtering the data so that only certain rows are shown.';

  addTextBox(howToTab, 'B11', 'K14', filteringInstructions);

  addHeading(howToTab, 'B16', 'K16', 'How to delete unwanted sheets');

  const howToDeleteInstructions = [
    'To delete a sheet in this report, right click on the tab at the bottom of the sheet and select delete. ',
    'Please note',
    ", you cannot undo this action. Only delete a sheet if you're sure you do not need that information. If you accidentally delete a sheet, re-open the report if you've not saved over the file or download the report again from ASC-WDS.",
  ];

  howToTab.mergeCells('B18:K22');
  howToTab.getCell('B18').value = {
    richText: [
      { font: { name: 'Serif', family: 4, size: 12 }, text: howToDeleteInstructions[0] },
      { font: { name: 'Serif', family: 4, size: 12, bold: true }, text: howToDeleteInstructions[1] },
      { font: { name: 'Serif', family: 4, size: 12 }, text: howToDeleteInstructions[2] },
    ],
  };
  howToTab.getCell('B18').alignment = { vertical: 'middle', horizontal: 'justify', wrapText: true };
  addBorder(howToTab, 'B18');

  const howToPrintTitle = 'How to print the information in this file';
  addHeading(howToTab, 'B24', 'K24', howToPrintTitle);

  const howToPrintInstructions =
    "To print the information in this report, click on the 'File' menu and then click 'Print'. You can choose to only print the page you're currently looking at or perhaps change the settings to print the whole report.";
  addTextBox(howToTab, 'B26', 'K28', howToPrintInstructions);

  howToTab.mergeCells('A29:L29');
};

const setColourBars = (worksheet) => {
  setColourLine(worksheet, 1, '123387');
  setColourLine(worksheet, 2, '6a88d4');
  setColourLine(worksheet, 3, '638eab');
};

const setColourLine = (worksheet, lineNumber, colour) => {
  worksheet.mergeCells(`A${lineNumber}:L${lineNumber}`);
  worksheet.getCell(`A${lineNumber}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colour },
  };
};

const addLine = (worksheet, startCell, endCell) => {
  worksheet.mergeCells(`${startCell}:${endCell}`);
  worksheet.getCell(startCell).border = {
    top: { style: 'thin' },
  };
};

const addBorder = (worksheet, cell) => {
  worksheet.getCell(cell).border = {
    ...excelUtils.fullBorder,
    color: { argb: 'a6a1a1' },
  };
};

const addHeading = (tab, startCell, endCell, content) => {
  tab.mergeCells(`${startCell}:${endCell}`);
  tab.getCell(startCell).value = content;
  tab.getCell(startCell).font = {
    family: 4,
    size: 16,
    bold: true,
    color: { argb: '282c84' },
  };
};

const addTextBox = (tab, startCell, endCell, content) => {
  tab.mergeCells(`${startCell}:${endCell}`);
  tab.getCell(startCell).value = content;
  tab.getCell(startCell).alignment = { vertical: 'middle', horizontal: 'justify', wrapText: true };
  tab.getCell(startCell).font = { name: 'Serif', family: 4, size: 12 };

  addBorder(tab, startCell);
};

router.route('/report').get(generateTrainingAndQualificationsReport);

module.exports = router;
module.exports.generateTrainingAndQualificationsReport = generateTrainingAndQualificationsReport;
