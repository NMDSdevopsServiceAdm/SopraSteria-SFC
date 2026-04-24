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

const borderColourLightGrey = { argb: 'CCCCCC' };
const topAndBottomGreyBorder = {
  top: { style: 'thin', color: borderColourLightGrey },
  bottom: { style: 'thin', color: borderColourLightGrey },
};
exports.topAndBottomGreyBorder = topAndBottomGreyBorder;

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

exports.addText = (tab, range, content, fontOptions = {}) => {
  const [startCell, endCell] = range.split(':');
  if (endCell) {
    tab.mergeCells(`${startCell}:${endCell}`);
  }

  const font = { family: 4, ...fontOptions };
  const cell = tab.getCell(startCell);
  cell.value = content;
  cell.font = font;
};

exports.addLink = (tab, range, { text, hyperlink }, fontOptions = {}) => {
  const [startCell, endCell] = range.split(':');
  if (endCell) {
    tab.mergeCells(`${startCell}:${endCell}`);
  }

  const font = { family: 4, color: newTextColours.linkBlue, underline: true, ...fontOptions };
  const cell = tab.getCell(startCell);
  cell.value = { text, hyperlink };
  cell.font = font;
};

exports.setColourForRange = (tab, range, { backgroundColour = null, textColour = null }) => {
  if (!backgroundColour && !textColour) {
    return;
  }

  const setCellColour = (cell) => {
    if (backgroundColour) {
      cell.fill = { ...cell.fill, type: 'pattern', pattern: 'solid', fgColor: backgroundColour };
    }
    if (textColour) {
      cell.font = { ...cell.font, color: textColour };
    }
  };

  forEachCellInRange(tab, range, setCellColour);
};

const standardFont = { name: 'Serif', family: 4, size: 12 };
exports.standardFont = standardFont;

const textBoxAlignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
exports.textBoxAlignment = textBoxAlignment;

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
  blue: { argb: '0050ab' },
};

const newBackgroundColours = {
  lightGrey: { argb: 'EFEFEF' },
  green: { argb: '34A853' },
  orange: { argb: 'FF7C1C' },
  red: { argb: 'EA4335' },
  darkBlue: { argb: '1A65A6' },
  lightBlue: { argb: 'DBE8FF' },
};

const newTextColours = {
  darkBlue: { argb: '1A65A6' },
  white: { argb: 'FFFFFF' },
  black: { argb: '000000' },
  linkBlue: { argb: '0000FF' },
};

exports.newBackgroundColours = newBackgroundColours;
exports.newTextColours = newTextColours;

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

const columnLabelToNumber = (columnLabel) => {
  return columnLabel
    .split('')
    .reverse()
    .reduce((sum, char, index) => {
      return sum + 26 ** index * (char.charCodeAt(0) - 64);
    }, 0);
};

const numberToColumnLabel = (columnNumber) => {
  let chars = [];
  let n = columnNumber;
  while (n > 26) {
    const modulus = n % 26;
    n = Math.floor(n / 26);
    chars.push(String.fromCharCode(modulus + 64));
  }
  chars.push(String.fromCharCode(n + 64));
  return chars.reverse().join('');
};

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

  const [_, startColStr, startRowStr, endColStr, endRowStr] = match;

  const startColumn = columnLabelToNumber(startColStr);
  const endColumn = columnLabelToNumber(endColStr);
  const startRow = Number(startRowStr);
  const endRow = Number(endRowStr);

  const rows = listRows(startRow, endRow);
  const columns = listRows(startColumn, endColumn).map(numberToColumnLabel);

  return { columns, rows };
};

exports.parseRange = parseRange;
