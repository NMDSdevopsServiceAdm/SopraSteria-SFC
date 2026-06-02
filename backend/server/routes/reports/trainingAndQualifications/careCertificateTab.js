const {
  newBackgroundColours,
  addText,
  setColourForRange,
  setBasicTableStyle,
  forEachCellInRange,
  autoAdjustWrapTextAndRowHeight,
} = require('../../../utils/excelUtils');

const lodash = require('lodash');

const HeaderRowNumber = 3;
const generateCareCertificateTab = async (workbook, careCertificateStatus, isParent = false) => {
  const careCertificateTab = workbook.addWorksheet('Care Certificates', { views: [{ showGridLines: false }] });

  const columnsToDisplay = [
    ...(isParent ? [{ columnName: 'Workplace', field: 'establishmentName', width: 33 }] : []),

    { columnName: 'Name or ID number', field: 'workerId', width: 30 },

    { columnName: 'Main job role', field: 'jobRole', width: 30 },
    { columnName: 'Care Certificate', field: 'careCertificate', width: 35 },
    { columnName: 'L2 Adult Social Care Certificate', field: 'l2CareCertificate', width: 35 },
  ];

  addTitle(careCertificateTab);

  const sortedData = lodash.sortBy(careCertificateStatus, ['establishmentName', 'workerId']);

  addCareCertificateTable(careCertificateTab, sortedData, columnsToDisplay);

  setHeightsAndWidths(careCertificateTab, columnsToDisplay);
  addFootNote(careCertificateTab);
};

const addTitle = (careCertificateTab) => {
  addText(careCertificateTab, 'B1:Z1', 'Care Certificates', { size: 24, bold: true });
  careCertificateTab.getCell('B1').alignment = { vertical: 'middle' };
  setColourForRange(careCertificateTab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });
};

const addCareCertificateTable = (tab, sortedData, columnsToDisplay) => {
  const tableRows = sortedData.map((careCertificateData) => {
    return columnsToDisplay.map(({ field }) => careCertificateData[field] ?? '-');
  });

  if (tableRows.length === 0) {
    tableRows.push(Array(columnsToDisplay.length).fill(''));
  }

  const careCertificateTable = tab.addTable({
    name: 'careCertificateTable',
    ref: `B${HeaderRowNumber}`,
    columns: columnsToDisplay.map(({ columnName }) => ({ name: columnName, filterButton: true })),
    rows: tableRows,
  });
  const tableRange = careCertificateTable.model.tableRef;

  careCertificateTable.commit();

  setBasicTableStyle(tab, tableRange, {
    hasTotalRow: false,
    alignHorizontalCenter: false,
    bold: false,
  });

  setFreezePane(tab);
};

const setHeightsAndWidths = (tab, columnsToDisplay) => {
  const columnWidths = [8, ...columnsToDisplay.map((column) => column.width)];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 1);
    column.width = width;
  });

  const rowHeights = [45, 18, 35, 30];

  rowHeights.forEach((height, index) => {
    tab.getRow(index + 1).height = height;
  });

  for (let i = 4; i <= tab.lastRow.number; i++) {
    tab.getRow(i).height = 22;
  }

  autoAdjustWrapTextForColumns(tab);
};

const autoAdjustWrapTextForColumns = (tab) => {
  const top = HeaderRowNumber + 1;
  const bottom = tab.lastRow.number;

  const autoAdjustRange = `B${top}:D${bottom}`;

  forEachCellInRange(tab, autoAdjustRange, (cell) => {
    const columnWidth = tab.getColumn(cell.col).width;
    autoAdjustWrapTextAndRowHeight(tab, cell, columnWidth);
  });
};

const addFootNote = (tab) => {
  const footNoteText = ['Note, the data displayed in this table has been generated from staff records.'];

  tab.addRow([]);

  footNoteText.forEach((text) => {
    const newRow = tab.lastRow.number + 1;
    addText(tab, `B${newRow}`, text);
  });
};

const setFreezePane = (tab) => {
  tab.views = [{ state: 'frozen', ySplit: 3, activeCell: 'B1' }, { showGridLines: false }];
};

module.exports.generateCareCertificateTab = generateCareCertificateTab;
