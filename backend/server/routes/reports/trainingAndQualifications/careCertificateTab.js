const {
  backgroundColours,
  newBackgroundColours,
  addText,
  setColourForRange,
  setBasicTableStyle,
  autoFitColumnWidthByTextLength,
} = require('../../../utils/excelUtils');

const colCache = require('exceljs/lib/utils/col-cache');
const lodash = require('lodash');

const HeaderRowNumber = 3;
const generateCareCertificateTab = async (workbook, careCertificateStatus, isParent = false) => {
  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });

  const columnsToDisplay = [
    ...(isParent ? [{ columnName: 'Workplace', field: 'establishmentName' }] : []),

    { columnName: 'Name or ID number', field: 'workerId' },

    { columnName: 'Main job role', field: 'jobRole' },
    { columnName: 'Care Certificate', field: 'careCertificate' },
    { columnName: 'L2 Adult Social Care Certificate', field: 'l2CareCertificate' },
  ];

  addTitle(careCertificateTab);

  const sortedData = lodash.sortBy(careCertificateStatus, ['establishmentName', 'workerId']);

  addCareCertificateTable(careCertificateTab, sortedData, columnsToDisplay);

  setHeightsAndWidths(careCertificateTab);
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

const setHeightsAndWidths = (tab) => {
  const columnWidths = [22, 22, 28, 28];

  columnWidths.forEach((width, index) => {
    const column = tab.getColumn(index + 2);
    column.width = width;
  });

  [2, 3, 4, 5].forEach((column) => {
    autoFitColumnWidthByTextLength(tab, column, 12);
  });

  const rowHeights = [48, 18, 35, 30];

  rowHeights.forEach((height, index) => {
    tab.getRow(index + 1).height = height;
  });

  for (let i = 4; i <= tab.lastRow.number; i++) {
    tab.getRow(i).height = 22;
  }
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
