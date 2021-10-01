const excelUtils = require('../../../utils/excelUtils');

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

  addTextBox(howToTab, 'B11', 'K15', filteringInstructions);

  addHeading(howToTab, 'B17', 'K17', 'How to delete unwanted sheets');

  const howToDeleteInstructions = [
    'To delete a sheet in this report, right click on the tab at the bottom of the sheet and select delete. ',
    'Please note',
    ", you cannot undo this action. Only delete a sheet if you're sure you do not need that information. If you accidentally delete a sheet, re-open the report if you've not saved over the file or download the report again from ASC-WDS.",
  ];

  howToTab.mergeCells('B19:K23');
  howToTab.getCell('B19').value = {
    richText: [
      { font: { name: 'Serif', family: 4, size: 12 }, text: howToDeleteInstructions[0] },
      { font: { name: 'Serif', family: 4, size: 12, bold: true }, text: howToDeleteInstructions[1] },
      { font: { name: 'Serif', family: 4, size: 12 }, text: howToDeleteInstructions[2] },
    ],
  };
  howToTab.getCell('B19').alignment = { vertical: 'middle', horizontal: 'justify', wrapText: true };
  addBorder(howToTab, 'B19');

  const howToPrintTitle = 'How to print the information in this file';
  addHeading(howToTab, 'B25', 'K25', howToPrintTitle);

  const howToPrintInstructions =
    "To print the information in this report, click on the 'File' menu and then click 'Print'. You can choose to only print the page you're currently looking at or perhaps change the settings to print the whole report.";
  addTextBox(howToTab, 'B27', 'K30', howToPrintInstructions);

  howToTab.mergeCells('A31:L31');
};

const setColourBars = (worksheet) => {
  setColourLine(worksheet, 1, '0050ab');
  setColourLine(worksheet, 2, 'a4b8df');
  setColourLine(worksheet, 3, '608ac8');
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
    color: { argb: '0050ab' },
  };
};

const addTextBox = (tab, startCell, endCell, content) => {
  tab.mergeCells(`${startCell}:${endCell}`);
  tab.getCell(startCell).value = content;
  tab.getCell(startCell).alignment = { vertical: 'middle', horizontal: 'justify', wrapText: true };
  tab.getCell(startCell).font = { name: 'Serif', family: 4, size: 12 };

  addBorder(tab, startCell);
};

module.exports.generateHowToTab = generateHowToTab;
