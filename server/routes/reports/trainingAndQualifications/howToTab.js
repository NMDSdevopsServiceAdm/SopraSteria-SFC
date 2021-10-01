const { addHeading, addLine, addTextBox, addBorder } = require('../../../utils/excelUtils');

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

  addTextBox(howToTab, 'B11', 'K16', filteringInstructions);

  addHeading(howToTab, 'B18', 'K18', 'How to delete unwanted sheets');

  const howToDeleteInstructions = [
    'To delete a sheet in this report, right click on the tab at the bottom of the sheet and select delete. ',
    'Please note',
    ", you cannot undo this action. Only delete a sheet if you're sure you do not need that information. If you accidentally delete a sheet, re-open the report if you've not saved over the file or download the report again from ASC-WDS.",
  ];

  howToTab.mergeCells('B20:K25');
  howToTab.getCell('B20').value = {
    richText: [
      { font: { name: 'Serif', family: 4, size: 12 }, text: howToDeleteInstructions[0] },
      { font: { name: 'Serif', family: 4, size: 12, bold: true }, text: howToDeleteInstructions[1] },
      { font: { name: 'Serif', family: 4, size: 12 }, text: howToDeleteInstructions[2] },
    ],
  };
  howToTab.getCell('B20').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  addBorder(howToTab, 'B20');

  const howToPrintTitle = 'How to print the information in this file';
  addHeading(howToTab, 'B27', 'K27', howToPrintTitle);

  const howToPrintInstructions =
    "To print the information in this report, click on the 'File' menu and then click 'Print'. You can choose to only print the page you're currently looking at or perhaps change the settings to print the whole report.";
  addTextBox(howToTab, 'B29', 'K33', howToPrintInstructions);

  howToTab.mergeCells('A34:L34');
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

module.exports.generateHowToTab = generateHowToTab;
