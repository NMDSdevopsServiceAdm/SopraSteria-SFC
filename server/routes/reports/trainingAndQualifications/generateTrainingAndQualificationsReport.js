/* eslint-disable no-unused-vars */
const excelJS = require('exceljs');
const express = require('express');
const router = express.Router({ mergeParams: true });
const moment = require('moment');

const generateTrainingAndQualificationsReport = async (_, res) => {
  const workbook = new excelJS.Workbook();

  workbook.creator = 'Skills-For-Care';
  workbook.properties.date1904 = true;

  const howToTab = workbook.addWorksheet('How to...');

  setColourBars(howToTab);

  howToTab.mergeCells('B5:K5');
  howToTab.getCell('B5').value = 'Training and qualifications report';
  howToTab.getCell('B5').font = {
    family: 4,
    size: 14,
    bold: true,
    color: '123387',
  };

  const filteringInstructionsTitle = 'How to sort and filter the table columns';

  howToTab.mergeCells('B7:K7');
  howToTab.getCell('B7').value = filteringInstructionsTitle;
  howToTab.getCell('B7').alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

  const filteringInstructions =
    'Click on the arrow in the header of the column you want to sort or filter. In the menu displayed, you can sort the data to suit your needs (for example, you can sort it alphabetically). The menu also lets you select what you want to view by filtering the data so that only certain rows are shown.';

  howToTab.mergeCells('B9:K12');
  howToTab.getCell('B9').value = filteringInstructions;
  howToTab.getCell('B9').alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

  const howToDeleteTitle = 'How to delete unwanted sheets';

  howToTab.mergeCells('B14:F14');
  howToTab.getCell('B14').value = howToDeleteTitle;

  const howToDelete =
    "To delete a sheet in this report, right click on the tab at the bottom of the sheet and select delete. Please note, you cannot undo this action. Only delete a sheet if you're sure you do not need that information. If you accidentally delete a sheet, re-open the report if you've not saved over the file or download the report again from ASC-WDS.";

  howToTab.mergeCells('B16:F19');
  howToTab.getCell('B16').value = howToDelete;

  const howToPrintTitle = 'How to print the information in this file';

  howToTab.mergeCells('B21:F21');
  howToTab.getCell('B21').value = howToPrintTitle;

  const howToPrint =
    "To print the information in this report, click on the 'File' menu and then click 'Print'. You can choose to only print the page you're currently looking at or perhaps change the settings to print the whole report.";

  howToTab.mergeCells('B23:F25');
  howToTab.getCell('B23').value = howToPrint;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + moment().format('DD-MM-YYYY') + '-training-report.xlsx',
  );

  await workbook.xlsx.write(res);
  return res.status(200).end();
};

const setColourBars = (worksheet) => {
  setColourLine(worksheet, 1, '123387');
  setColourLine(worksheet, 2, '6a88d4');
  setColourLine(worksheet, 3, '638eab');
};

const setColourLine = (worksheet, lineNumber, colour) => {
  worksheet.mergeCells(`A${lineNumber}:K${lineNumber}`);
  worksheet.getCell(`A${lineNumber}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colour },
  };
};

router.route('/').get(generateTrainingAndQualificationsReport);

module.exports = router;
module.exports.generateTrainingAndQualificationsReport = generateTrainingAndQualificationsReport;
