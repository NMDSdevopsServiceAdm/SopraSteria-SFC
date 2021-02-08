exports.blueBackground = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: '282c84' },
};

exports.fullBorder = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};
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

exports.fitColumnsToSize = function (ws) {
  eachColumnInRange(ws, 1, 25, (column) => {
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
    endWidth += 0.71; // compensate for observed reduction
    endWidth += 1.5; // buffer space
    column.width = endWidth;
  });
};
