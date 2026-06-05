const {
  addText,
  setColourForRange,
  newBackgroundColours,
  newTextColours,
  setColourForCell,
  setBasicTableStyle,
  tableHeaderCellStyle,
  applyStyleToRange,
  colourSchemeForTrainingExpiry,
  forEachCellInRange,
  autoAdjustWrapTextAndRowHeight,
} = require('../../../utils/excelUtils');

const colCache = require('exceljs/lib/utils/col-cache');
const lodash = require('lodash');

const HeaderRowNumber = 4;

const generateTrainingByCategoryTab = async (workbook, trainingByCategoryBreakdowns, isParent = false) => {
  const trainingByCategoryTab = workbook.addWorksheet('Training by category', { views: [{ showGridLines: false }] });

  const columnsToDisplay = [
    { columnName: 'Training category', field: 'trainingCategory' },

    ...(isParent ? [{ columnName: 'Workplace', field: 'workplaceName' }] : []),

    { columnName: 'Mandatory', field: 'mandatory' },
    { columnName: 'Total', field: 'total' },
    { columnName: 'Expired', field: 'expired' },
    { columnName: 'Expiring soon', field: 'expiringSoon' },
    { columnName: 'Up-to-date', field: 'upToDate' },
    { columnName: 'Missing', field: 'missing' },
  ];

  addTitle(trainingByCategoryTab);
  addTopTableHeader(trainingByCategoryTab, columnsToDisplay);

  const sortedData = lodash.sortBy(trainingByCategoryBreakdowns, ['workplaceName', 'trainingCategory']);

  addTrainingByCategoryTable(trainingByCategoryTab, sortedData, columnsToDisplay, isParent);
  setBoldStyleForHeaderRow(trainingByCategoryTab);
  setHeightsAndWidths(trainingByCategoryTab);

  addFootNote(trainingByCategoryTab);
};

const addTitle = (trainingByCategoryTab) => {
  addText(trainingByCategoryTab, 'B1:Z1', 'Training records by category', { size: 24, bold: true });
  trainingByCategoryTab.getCell('B1').alignment = { vertical: 'middle' };
  setColourForRange(trainingByCategoryTab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });
};

const addTopTableHeader = (tab, columnsToDisplay) => {
  const lastColumnLetter = colCache.n2l(1 + columnsToDisplay.length);

  const topHeaderRange = `B3:${lastColumnLetter}3`;
  addText(tab, topHeaderRange, 'Mandatory and non-mandatory training', { size: 16, bold: true });
  applyStyleToRange(tab, topHeaderRange, tableHeaderCellStyle);
};

const addTrainingByCategoryTable = (tab, sortedData, columnsToDisplay, isParent) => {
  const dataRows = sortedData.filter((row) => {
    return !(row.trainingCategory === 'Total' || row.workplaceName === 'Total');
  });
  const tableRows = dataRows.map((trainingData) => {
    return columnsToDisplay.map(({ field }) => trainingData[field] ?? '-');
  });

  if (tableRows.length === 0) {
    tableRows.push(Array(columnsToDisplay.length).fill(''));
  }

  const trainingTable = tab.addTable({
    name: 'trainingByCategoryTable',
    ref: `B${HeaderRowNumber}`,
    columns: columnsToDisplay.map(({ columnName }) => ({ name: columnName, filterButton: true })),
    rows: tableRows,
  });
  const tableRange = trainingTable.model.tableRef;

  trainingTable.commit();

  addTotalRow(tab, sortedData, columnsToDisplay, isParent);

  setBasicTableStyle(tab, tableRange, {
    hasTotalRow: false,
    alignHorizontalCenter: false,
    bold: false,
  });

  setAlignmentForColumns(tab);
  setBoldStyleForCountColumns(tab);

  setStyleForTrainingByCategoryTable(tab);
  setFreezePane(tab);
};

const addTotalRow = (tab, sortedData, columnsToDisplay, isParent) => {
  const totalsRow = sortedData.find((row) =>
    isParent ? row.workplaceName === 'Total' : row.trainingCategory === 'Total',
  );

  if (!totalsRow) return;

  const totalRowValues = columnsToDisplay.map(({ field }) => {
    if (field === 'trainingCategory') {
      return isParent ? '' : 'Total';
    }

    if (isParent && field === 'workplaceName') {
      return 'Total';
    }

    return totalsRow[field] ?? '-';
  });

  const rowIndex = tab.lastRow.number + 1;

  totalRowValues.forEach((value, index) => {
    const cell = tab.getRow(rowIndex).getCell(index + 2);

    cell.value = value;

    const style = lodash.cloneDeep(tableHeaderCellStyle);

    const field = columnsToDisplay[index].field;

    if ((!isParent && field === 'trainingCategory') || (isParent && field === 'workplaceName')) {
      style.alignment = {
        ...style.alignment,
        horizontal: 'left',
      };
    }

    cell.style = style;
  });
};

const setHeightsAndWidths = (tab) => {
  const columnWidths = [8, 33, 18, 18, 18, 18, 18, 18];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  const rowHeights = [45, 18, 22, 38];

  rowHeights.forEach((height, index) => {
    const row = tab.getRow(index + 1);
    row.height = height;
  });

  autoAdjustWrapTextForCategoryNameAndWorkplaceColumn(tab);
};

const autoAdjustWrapTextForCategoryNameAndWorkplaceColumn = (tab) => {
  const top = HeaderRowNumber + 1;
  const bottom = tab.lastRow.number;

  const autoAdjustRange = `B${top}:C${bottom}`;

  forEachCellInRange(tab, autoAdjustRange, (cell) => {
    autoAdjustWrapTextAndRowHeight(tab, cell);
  });
};

const setAlignmentForColumns = (tab) => {
  const headerValues = tab.getRow(HeaderRowNumber).values;

  headerValues.forEach((header, index) => {
    if (header === 'Training category' || header === 'Workplace' || !header) {
      return;
    }

    tab.getColumn(index).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
  });
};

const setBoldStyleForHeaderRow = (tab) => {
  const headerRow = tab.getRow(HeaderRowNumber);

  headerRow.eachCell((cell) => {
    cell.font = {
      ...cell.font,
      bold: true,
    };
  });
};

const setBoldStyleForCountColumns = (tab) => {
  const headerValues = tab.getRow(HeaderRowNumber).values;

  const columnsToBold = ['Total', 'Expired', 'Expiring soon', 'Up-to-date', 'Missing'];

  headerValues.forEach((header, index) => {
    if (!columnsToBold.includes(header)) {
      return;
    }

    for (let rowNumber = HeaderRowNumber + 1; rowNumber <= tab.lastRow.number; rowNumber++) {
      const cell = tab.getRow(rowNumber).getCell(index);

      cell.font = {
        ...cell.font,
        bold: true,
        size: 12,
      };
    }
  });
};

const setStyleForTrainingByCategoryTable = (tab) => {
  const headerRow = tab.getRow(HeaderRowNumber);

  const headerStyles = {
    Total: {
      backgroundColour: newBackgroundColours.black,
      textColour: newTextColours.white,
    },

    ...Object.fromEntries(
      colourSchemeForTrainingExpiry.map(({ text, colour }) => [
        text,
        {
          backgroundColour: colour,
          textColour: newTextColours.black,
        },
      ]),
    ),
  };

  Object.entries(headerStyles).forEach(([headerName, colours]) => {
    const columnNumber = headerRow.values.indexOf(headerName);

    if (columnNumber === -1) {
      return;
    }

    const cell = tab.getCell(HeaderRowNumber, columnNumber);

    setColourForCell(cell, colours);
  });
};

const addFootNote = (tab) => {
  const footNoteText = [
    'The figures shown could include records of staff who have been flagged as long-term absent.',
    'Note, the number in the Missing column may include training not yet taken by new starters.',
  ];

  tab.addRow([]);

  footNoteText.forEach((text) => {
    const newRow = tab.lastRow.number + 1;
    addText(tab, `B${newRow}`, text);
  });
};

const setFreezePane = (tab) => {
  tab.views = [{ state: 'frozen', ySplit: 4, activeCell: 'B1' }, { showGridLines: false }];
};
module.exports = { generateTrainingByCategoryTab };
