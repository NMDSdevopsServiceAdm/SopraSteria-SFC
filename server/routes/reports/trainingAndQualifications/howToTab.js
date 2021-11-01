const {
  addHeading,
  addLine,
  addTextBox,
  addBorder,
  standardFont,
  textBoxAlignment,
} = require('../../../utils/excelUtils');

const generateHowToTab = (workbook, isParent = false) => {
  const howToTab = workbook.addWorksheet('How to...', { views: [{ showGridLines: false }] });

  howToTab.getColumn(1).width = 4;
  howToTab.getColumn(12).width = 4;

  addColourBars(howToTab);

  addTitleToHowToTab(howToTab, isParent);
  addLine(howToTab, 'A7', 'L7');

  addHeading(howToTab, 'B9', 'K9', 'How to sort and filter the table columns');
  addTextBox(howToTab, 'B11', 'K16', textBoxes.filteringInstructions);

  addHeading(howToTab, 'B18', 'K18', 'How to delete unwanted sheets');
  addDeleteInstructionsTextBox(howToTab, 'B20', 'K25');

  addHeading(howToTab, 'B27', 'K27', 'How to print the information in this file');
  addTextBox(howToTab, 'B29', 'K33', textBoxes.howToPrintInstructions);

  howToTab.mergeCells('A34:L34');
};

const addColourBars = (worksheet) => {
  addColourLine(worksheet, 1, '0050ab');
  addColourLine(worksheet, 2, 'a4b8df');
  addColourLine(worksheet, 3, '608ac8');
};

const addColourLine = (worksheet, lineNumber, colour) => {
  worksheet.mergeCells(`A${lineNumber}:L${lineNumber}`);
  worksheet.getCell(`A${lineNumber}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colour },
  };
};

const addDeleteInstructionsTextBox = (howToTab, startCell, endCell) => {
  howToTab.mergeCells(`${startCell}:${endCell}`);
  howToTab.getCell(startCell).value = {
    richText: [
      { font: standardFont, text: textBoxes.howToDeleteInstructions[0] },
      { font: { ...standardFont, bold: true }, text: textBoxes.howToDeleteInstructions[1] },
      { font: standardFont, text: textBoxes.howToDeleteInstructions[2] },
    ],
  };
  howToTab.getCell(startCell).alignment = textBoxAlignment;
  addBorder(howToTab, startCell);
};

const textBoxes = {
  filteringInstructions:
    'Click on the arrow in the header of the column you want to sort or filter. In the menu displayed, you can sort the data to suit your needs (for example, you can sort it alphabetically). The menu also lets you select what you want to view by filtering the data so that only certain rows are shown.',
  howToDeleteInstructions: [
    'To delete a sheet in this report, right click on the tab at the bottom of the sheet and select delete. ',
    'Please note',
    ", you cannot undo this action. Only delete a sheet if you're sure you do not need that information. If you accidentally delete a sheet, re-open the report if you've not saved over the file or download the report again from ASC-WDS.",
  ],
  howToPrintInstructions:
    "To print the information in this report, click on the 'File' menu and then click 'Print'. You can choose to only print the page you're currently looking at or perhaps change the settings to print the whole report.",
};

const addTitleToHowToTab = (howToTab, isParent) => {
  const title = isParent ? 'Parent training and qualifications report' : 'Training and qualifications report';
  addHeading(howToTab, 'B5', 'K5', title);
}

module.exports.generateHowToTab = generateHowToTab;
module.exports.addTitleToHowToTab = addTitleToHowToTab;
