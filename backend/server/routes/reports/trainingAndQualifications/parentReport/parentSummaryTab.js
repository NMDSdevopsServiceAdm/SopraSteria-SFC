const { addText, setColourForRange, newBackgroundColours } = require('../../../../utils/excelUtils');

const generateParentSummaryTab = async (workbook, establishment, summaryTabData) => {
  const summaryTab = workbook.addWorksheet('Summary', { views: [{ showGridLines: false }] });
  const establishmentName = establishment.NameValue;

  addTitle(summaryTab, establishmentName);
  addBannerImage(workbook, summaryTab);
  setHeightAndWidths(summaryTab);
};

const addTitle = (tab, establishmentName) => {
  addText(tab, 'B2:I2', establishmentName, { size: 26, bold: true });
  addText(tab, 'B3:C3', 'Summary', { size: 24, bold: true });

  setColourForRange(tab, 'A2:AP3', { backgroundColour: newBackgroundColours.lightGrey });
};

const addBannerImage = (workbook, tab) => {
  tab.addImage(0, { tl: { col: 1, row: 0 }, ext: { width: 431, height: 62.4 } });
};

const setHeightAndWidths = (tab) => {
  const columnWidths = [6.83, 26.83, ...Array(24).fill(16.83)];
  const rowHeights = [45, 45, 45, 36, 36, 36];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
    column.alignment = { vertical: 'middle' };
  });

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });
};

module.exports = { generateParentSummaryTab };
