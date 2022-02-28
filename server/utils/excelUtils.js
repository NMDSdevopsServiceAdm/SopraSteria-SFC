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

exports.addHeading = (tab, startCell, endCell, content, textColour, size) => {
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

  cell.font = { color: textColour };
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

exports.makeRowBold = (tab, rowNumber) => {
  tab.getRow(rowNumber).font = { bold: true };
};

exports.setColumnWidths = (tab) => {
  const longColumn = tab.getColumn(9);
  const longColumnsecond = tab.getColumn(10);

  longColumn.width = 33;
  longColumnsecond.width = 29;
};
