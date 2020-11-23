exports.blueBackground = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: '282c84' },
};

function eachColumnInRange(ws, col1, col2, cb) {
  for (let c = col1; c <= col2; c++) {
    let col = ws.getColumn(c);
    cb(col);
  }
}

exports.autoFitColumns = function (ws, headerRow) {
  eachColumnInRange(ws, 2, 13, (column) => {
    let maxWidth = 40;
    let headerCellWidth = 0;
    const cellsWidth = [];
    column.eachCell((cell) => {
      console.log(cell.row);
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
            headerCellWidth = width;
          }
        }
      }
    });

    let mean = cellsWidth.reduce((acc, val) => acc + val, 0) / cellsWidth.length;
    //   console.log(JSON.stringify(cellsWidth) + " === " + mean);
    let endWidth = Math.max(headerCellWidth, mean);
    endWidth += 0.71; // compensate for observed reduction
    endWidth += 1; // buffer space
    column.width = endWidth;
  });
};
