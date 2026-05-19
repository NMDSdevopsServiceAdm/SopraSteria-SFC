const colCache = require('exceljs/lib/utils/col-cache');
const excelJS = require('exceljs');
const lodash = require('lodash');

//  ===== constants definitions =====

exports.blueBackground = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: '282c84' },
};

const fullBorder = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};
exports.fullBorder = fullBorder;

const standardFont = { name: 'Serif', family: 4, size: 12 };
exports.standardFont = standardFont;

const textBoxAlignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
exports.textBoxAlignment = textBoxAlignment;

exports.backgroundColours = {
  yellow: { argb: 'FFEA99' },
  blue: { argb: '0050AB' },
  red: { argb: 'FFC0C8' },
  green: { argb: 'BBEDC9' },
  lightBlue: { argb: 'A3CBFA' },
  darkBlue: { argb: '5981B8' },
};

exports.textColours = {
  yellow: { argb: '945B19' },
  white: { argb: 'FFFFFF' },
  red: { argb: '960512' },
  green: { argb: '005713' },
  black: { argb: '000000' },
  blue: { argb: '0050AB' },
};

const newBackgroundColours = {
  lightGrey: { argb: 'EFEFEF' },
  white: { argb: 'FFFFFF' },
  green: { argb: '34A853' },
  orange: { argb: 'FF7C1C' },
  red: { argb: 'EA4335' },
  darkBlue: { argb: '1A65A6' },
  lightBlue: { argb: 'DBE8FF' },
  black: { argb: '000000' },
};

const newTextColours = {
  darkBlue: { argb: '1A65A6' },
  white: { argb: 'FFFFFF' },
  black: { argb: '000000' },
  linkBlue: { argb: '0000FF' },
};

exports.newBackgroundColours = newBackgroundColours;
exports.newTextColours = newTextColours;

const borderColours = {
  lightGrey: { argb: 'CCCCCC' },
  black: { argb: '000000' },
};
exports.borderColours = borderColours;

const lightGreyBorderTopAndBottom = {
  top: { style: 'thin', color: borderColours.lightGrey },
  bottom: { style: 'thin', color: borderColours.lightGrey },
};

const blackBorderLeftAndRight = {
  left: { style: 'thin', color: borderColours.black },
  right: { style: 'thin', color: borderColours.black },
};

const blackBorderTopAndBottom = {
  top: { style: 'thin', color: borderColours.black },
  bottom: { style: 'thin', color: borderColours.black },
};

const blackBorderBottom = {
  bottom: { style: 'thin', color: borderColours.black },
};

const blackBorderAllSides = { ...blackBorderLeftAndRight, ...blackBorderTopAndBottom };

const thickBlackBorderLeft = {
  left: { style: 'thick', color: borderColours.black },
};

const thickBlackBorderRight = {
  right: { style: 'thick', color: borderColours.black },
};

const borderStyles = {
  tableCell: { ...blackBorderLeftAndRight, ...lightGreyBorderTopAndBottom },
  lightGreyBorderTopAndBottom,
  blackBorderLeftAndRight,
  blackBorderTopAndBottom,
  blackBorderAllSides,
  thickBlackBorderLeft,
  thickBlackBorderRight,
};
exports.borderStyles = borderStyles;

const tableDataCellStyle = {
  font: { size: 12, family: 4 },
  border: borderStyles.tableCell,
  alignment: { vertical: 'middle', horizontal: 'left' },
};

const tableHeaderCellStyle = {
  font: { size: 12, family: 4, bold: true },
  fill: { type: 'pattern', pattern: 'solid', fgColor: newBackgroundColours.lightGrey },
  border: borderStyles.blackBorderAllSides,
  alignment: { vertical: 'middle', horizontal: 'left' },
};

exports.tableDataCellStyle = tableDataCellStyle;
exports.tableHeaderCellStyle = tableHeaderCellStyle;

exports.setBasicTableStyle = (
  tab,
  tableRange,
  { hasTotalRow = true, alignHorizontalCenter = true, bold = false } = {},
) => {
  const { top, left, bottom, right } = colCache.decode(tableRange);

  const headerRange = colCache.encode(top, left, top, right);
  const lastDataCellRow = hasTotalRow ? bottom - 1 : bottom;
  const dataCellsRange = colCache.encode(top + 1, left, lastDataCellRow, right);

  const dataCellStyle = lodash.cloneDeep(tableDataCellStyle);
  const headerCellStyle = lodash.cloneDeep(tableHeaderCellStyle);

  if (bold) {
    dataCellStyle.font.bold = true;
    headerCellStyle.font.bold = true;
  }

  if (alignHorizontalCenter) {
    dataCellStyle.alignment.horizontal = 'center';
    headerCellStyle.alignment.horizontal = 'center';
  }

  applyStyleToRange(tab, headerRange, headerCellStyle);
  applyStyleToRange(tab, dataCellsRange, dataCellStyle);

  const lastRowRange = colCache.encode(bottom, left, bottom, right);

  if (hasTotalRow) {
    applyStyleToRange(tab, lastRowRange, headerCellStyle);
  } else {
    applyStyleToRange(tab, lastRowRange, { border: blackBorderBottom });
  }
};

const colourSchemeForTrainingExpiry = [
  { text: 'Expired', colour: newBackgroundColours.red },
  { text: 'Expiring soon', colour: newBackgroundColours.orange },
  { text: 'Up-to-date', colour: newBackgroundColours.green },
  { text: 'Missing', colour: newBackgroundColours.red },
];
exports.colourSchemeForTrainingExpiry = colourSchemeForTrainingExpiry;

exports.conditionalColoursForTrainingExpiry = colourSchemeForTrainingExpiry.map(({ text, colour }) => {
  return {
    type: 'containsText',
    operator: 'containsText',
    text,
    style: {
      fill: { type: 'pattern', pattern: 'solid', bgColor: colour },
      font: { bold: true, size: 12, family: 4 },
      border: borderStyles.blackBorderAllSides,
    },
  };
});

exports.defaultDateFormat = 'd mmm yyyy';

//  ===== helper methods =====

function eachColumnInRange(ws, col1, col2, cb) {
  for (let c = col1; c <= col2; c++) {
    let col = ws.getColumn(c);
    cb(col);
  }
}
exports.formatBool = (input) => {
  return input ? 'yes' : 'no';
};

exports.autoFitColumns = function (ws, headerRow) {
  eachColumnInRange(ws, 2, 13, (column) => {
    let maxWidth = 40;
    let headerCellWidth = [];
    const cellsWidth = [];
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

          width = Math.min(maxWidth, width);
          cellsWidth.push(width);
          if (cell.row === headerRow) {
            headerCellWidth.push(width);
          }
        }
      }
    });

    let mean = cellsWidth.reduce((acc, val) => acc + val, 0) / cellsWidth.length;
    let endWidth = Math.max(Math.max(...headerCellWidth), mean);
    endWidth += 0.71; // compensate for observed reduction
    endWidth += 1; // buffer space
    column.width = endWidth;
  });
};

exports.fitColumnsToSize = function (ws, startingColumn = 1, customWidth = 2.21) {
  eachColumnInRange(ws, startingColumn, ws.columns.length, (column) => {
    const cellsWidth = [];
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

          cellsWidth.push(width);
        }
      }
    });

    let endWidth = Math.max(...cellsWidth);
    endWidth += customWidth;
    column.width = endWidth;
  });
};

exports.autoFitColumnWidthByTextLength = function (worksheet, columnLetter, fontsize = 12) {
  const cells = [];
  const column = worksheet.getColumn(columnLetter);
  column.eachCell((cell) => cells.push(cell));

  const cellsToConsider = cells.filter(
    (cell) => !cell.isMerged && cell.value?.length > 0 && cell.type === excelJS.ValueType.String,
  );
  if (!cellsToConsider.length) {
    return;
  }

  const maxTextLength = Math.max(...cellsToConsider.map((cell) => cell.value.length));
  const currentWidth = column.width ?? 0;
  const newColumnWidth = (maxTextLength * fontsize) / 12.8;

  column.width = Math.max(currentWidth, newColumnWidth);
};

const addBorder = (worksheet, cell) => {
  worksheet.getCell(cell).border = {
    ...fullBorder,
    color: { argb: 'a6a1a1' },
  };
};
exports.addBorder = addBorder;

exports.addBordersToAllFilledCells = (tab, startingRow) => {
  tab.eachRow(function (row, rowNumber) {
    if (rowNumber > startingRow) {
      row.eachCell((cell) => {
        cell.border = fullBorder;
      });
    }
  });
};

exports.addTextBox = (tab, startCell, endCell, content) => {
  tab.mergeCells(`${startCell}:${endCell}`);
  tab.getCell(startCell).value = content;
  tab.getCell(startCell).alignment = textBoxAlignment;
  tab.getCell(startCell).font = standardFont;

  addBorder(tab, startCell);
};

exports.addHeading = (tab, startCell, endCell, content, textColour = this.textColours.blue, size = 16) => {
  tab.mergeCells(`${startCell}:${endCell}`);
  tab.getCell(startCell).value = content;
  tab.getCell(startCell).font = {
    family: 4,
    size: size,
    bold: true,
    color: textColour,
  };
};

exports.addLine = (worksheet, startCell, endCell) => {
  worksheet.mergeCells(`${startCell}:${endCell}`);
  worksheet.getCell(startCell).border = {
    top: { style: 'thin' },
  };
};

const addText = (tab, range, content, fontOptions = {}) => {
  const [startCell, endCell] = range.split(':');
  if (endCell) {
    tab.mergeCells(`${startCell}:${endCell}`);
  }

  const font = { family: 4, size: 12, ...fontOptions };
  const cell = tab.getCell(startCell);
  cell.value = content;
  cell.font = font;
};
exports.addText = addText;

exports.addLink = (tab, range, { text, hyperlink }, fontOptions = {}) => {
  const fontWithLinkStyle = { color: newTextColours.linkBlue, underline: true, ...fontOptions };
  const content = { text, hyperlink };

  return addText(tab, range, content, fontWithLinkStyle);
};

const applyStyleToCell = (cell, styleChanges) => {
  cell.style = lodash.merge({}, cell.style, styleChanges);
};
exports.applyStyleToCell = applyStyleToCell;

const applyStyleToRange = (tab, range, styleChanges) => {
  forEachCellInRange(tab, range, (cell) => {
    applyStyleToCell(cell, styleChanges);
  });
};
exports.applyStyleToRange = applyStyleToRange;

const setColourForCell = (cell, { backgroundColour = null, textColour = null }) => {
  const newCellStyle = {};
  if (backgroundColour) {
    newCellStyle.fill = { type: 'pattern', pattern: 'solid', fgColor: backgroundColour };
  }
  if (textColour) {
    newCellStyle.font = { color: textColour };
  }
  applyStyleToCell(cell, newCellStyle);
};
exports.setColourForCell = setColourForCell;

exports.setColourForRange = (tab, range, { backgroundColour = null, textColour = null }) => {
  if (!backgroundColour && !textColour) {
    return;
  }

  const callback = (cell) => {
    setColourForCell(cell, { backgroundColour, textColour });
  };

  forEachCellInRange(tab, range, callback);
};

exports.setTableHeadingsStyle = (tab, currentLineNumber, backgroundColour, textColour, cellColumns) => {
  tab.getRow(currentLineNumber).alignment = { horizontal: 'center' };

  cellColumns.map((key) => {
    tab.getCell(key + currentLineNumber).font = { bold: true, color: textColour };
    tab.getCell(key + currentLineNumber).alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
    tab.getCell(key + currentLineNumber).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: backgroundColour,
    };
  });
};

exports.setCellTextAndBackgroundColour = (tab, cellCoordinate, backgroundColour, textColour) => {
  const cell = tab.getCell(cellCoordinate);
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: backgroundColour,
  };

  cell.font = { ...cell.font, color: textColour };
};

exports.alignColumnToLeft = (tab, colNumber) => {
  tab.getColumn(colNumber).alignment = { horizontal: 'left' };
};

exports.addBlankRowIfTableEmpty = (tableObject, noOfColumns) => {
  const rowCells = [];
  for (let i = 0; i < noOfColumns; i++) rowCells.push('');

  if (tableObject.table.rows.length == 0) {
    tableObject.addRow(rowCells);
  }
};

exports.makeRowBold = (tab, rowNumber) => {
  tab.getRow(rowNumber).font = { bold: true };
};

exports.setColumnWidths = (tab) => {
  const longColumn = tab.getColumn(9);
  const longColumnsecond = tab.getColumn(10);

  longColumn.width = 33;
  longColumnsecond.width = 29;
};

const listRows = (startRow, endRow) => {
  if (endRow < startRow) {
    return listRows(endRow, startRow);
  }

  return Array(endRow - startRow + 1)
    .fill(null)
    .map((_, index) => startRow + index);
};

const columnLabelToNumber = (columnLabel) => colCache.l2n(columnLabel);
const numberToColumnLabel = (number) => colCache.n2l(number);

const forEachCellInRange = (tab, range, callback) => {
  const { columns, rows } = parseRange(range);
  rows.forEach((row) => {
    columns.forEach((column) => {
      const cell = tab.getRow(row).getCell(column);
      callback(cell);
    });
  });
};
exports.forEachCellInRange = forEachCellInRange;

exports.forEachColumnInRange = (tab, range, callback) => {
  const { columns } = parseRange(range);
  columns.forEach((columnLabel) => {
    const column = tab.getColumn(columnLabel);
    callback(column);
  });
};

const parseRange = (range) => {
  const regex = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/i;
  const match = range.match(regex);

  if (!match) {
    return {};
  }

  const { top, left, bottom, right } = colCache.decode(range);

  const startColumn = left;
  const endColumn = right;
  const startRow = top;
  const endRow = bottom;

  const rows = listRows(startRow, endRow);
  const columns = listRows(startColumn, endColumn).map(numberToColumnLabel);

  return { columns, rows };
};

exports.parseRange = parseRange;

const rangeOfNumber = (startNumber, endNumber) => {
  if (startNumber > endNumber) {
    return rangeOfNumber(endNumber, startNumber);
  }
  const count = endNumber - startNumber;
  return Array(count)
    .fill(null)
    .map((_, index) => {
      return startNumber + index;
    });
};

exports.rangeOfNumber = rangeOfNumber;

exports.autoAdjustWrapTextAndRowHeight = (tab, cell, columnWidth = 35, defaultHeight = 22) => {
  if (cell.type !== excelJS.ValueType.String || !cell.value?.length) {
    return;
  }

  const textInCell = cell.value;

  const numberOfLinesNeeded = countNumberOfLinesInDefaultFont(textInCell, columnWidth);
  if (numberOfLinesNeeded <= 1) {
    return;
  }

  applyStyleToCell(cell, { alignment: { wrapText: true } });

  const heightAdjustFormula = (x, defaultHeight) => Math.ceil((34.5 * x - 2.5 * x * x - 25) * (defaultHeight / 22));
  const adjustedHeight = heightAdjustFormula(numberOfLinesNeeded, defaultHeight);

  const row = tab.getRow(cell.row);
  row.height = Math.max(row.height ?? 0, adjustedHeight);
};

const charPixelWidth = {
  0: 6.08,
  1: 6.08,
  2: 6.08,
  3: 6.08,
  4: 6.08,
  5: 6.08,
  6: 6.08,
  7: 6.08,
  8: 6.08,
  9: 6.08,
  a: 5.75,
  b: 6.3,
  c: 5.07,
  d: 6.3,
  e: 5.97,
  f: 3.66,
  g: 5.65,
  h: 6.3,
  i: 2.75,
  j: 2.87,
  k: 5.46,
  l: 2.75,
  m: 9.59,
  n: 6.3,
  o: 6.33,
  p: 6.3,
  q: 6.3,
  r: 4.18,
  s: 4.69,
  t: 4.02,
  u: 6.3,
  v: 5.42,
  w: 8.58,
  x: 5.2,
  y: 5.43,
  z: 4.74,
  A: 6.94,
  B: 6.53,
  C: 6.4,
  D: 7.38,
  E: 5.86,
  F: 5.51,
  G: 7.57,
  H: 7.48,
  I: 3.02,
  J: 3.83,
  K: 6.23,
  L: 5.04,
  M: 10.26,
  N: 7.75,
  O: 7.95,
  P: 6.2,
  Q: 8.07,
  R: 6.52,
  S: 5.51,
  T: 5.85,
  U: 7.7,
  V: 6.81,
  W: 10.68,
  X: 6.23,
  Y: 5.85,
  Z: 5.62,
  '(': 3.64,
  ')': 3.64,
  ',': 2.99,
  "'": 2.65,
  ' ': 2.71,
  ':': 3.21,
};

const getTextWidthInDefaultFont = (text) => {
  return lodash
    .chain(text.split(''))
    .map((char) => charPixelWidth[char] ?? 7)
    .sum()
    .value();
};

const countNumberOfLinesInDefaultFont = (text, columnWidth = 35) => {
  const words = text?.split(/[ -]/);
  if (!words?.length) {
    return 1;
  }

  const columnWidthInPixels = 5.8 * columnWidth;
  const whitespaceWidth = charPixelWidth[' '];

  const allWordsWidths = words.map(getTextWidthInDefaultFont);

  let lineNumbers = 1;
  let currentLineWidth = allWordsWidths[0];

  allWordsWidths.slice(1).forEach((nextWord) => {
    currentLineWidth += nextWord + whitespaceWidth;
    const canFitSingleLine = currentLineWidth <= columnWidthInPixels;
    if (!canFitSingleLine) {
      lineNumbers += 1;
      currentLineWidth = nextWord;
    }
  });

  return lineNumbers;
};

exports.countNumberOfLinesInCalibriFont = countNumberOfLinesInDefaultFont;

const drawColourBoxWithBorder = (tab, range, { backgroundColour = null, textColour = null }) => {
  const { top, left, bottom, right } = colCache.decode(range);

  const newCellStyle = {};
  if (backgroundColour) {
    newCellStyle.fill = { type: 'pattern', pattern: 'solid', fgColor: backgroundColour };
  }
  if (textColour) {
    newCellStyle.font = { color: textColour };
  }

  forEachCellInRange(tab, range, (cell) => {
    const { col, row } = colCache.decode(cell.address);

    const border = checkCellBorders({ top, left, bottom, right, col, row });

    applyStyleToCell(cell, { ...newCellStyle, border });
  });
};

exports.drawColourBoxWithBorder = drawColourBoxWithBorder;

function checkCellBorders({ top, left, bottom, right, col, row }, borderStyle = null) {
  borderStyle = borderStyle ?? { style: 'thin', color: borderColours.black };

  let borders = {};
  if (top === row) {
    borders.top = borderStyle;
  }
  if (bottom === row) {
    borders.bottom = borderStyle;
  }
  if (left === col) {
    borders.left = borderStyle;
  }
  if (right === col) {
    borders.right = borderStyle;
  }
  return borders;
}
