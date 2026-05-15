const { convertWorkersWithCareCertificateStatus } = require('../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  setTableHeadingsStyle,
  backgroundColours,
  textColours,
  addBordersToAllFilledCells,
  fitColumnsToSize,
  alignColumnToLeft,
  addBlankRowIfTableEmpty,
  newBackgroundColours,
  addText,
  setColourForRange,
  tableHeaderCellStyle,
  applyStyleToRange,
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const colCache = require('exceljs/lib/utils/col-cache');
const lodash = require('lodash');

const columnsToDisplay = [
  { columnName: 'Name or ID number', field: 'mandatory' },
  { columnName: 'Main job role', field: 'total' },
  { columnName: 'Care certificate', field: 'expired' },
  { columnName: 'L2 Adult Social Care Certificate', field: 'expiringSoon' },
];

const generateCareCertificateTab = async (workbook, establishmentId, isParent = false) => {
  const rawEstablishments = await models.establishment.getWorkersWithCareCertificateStatus(establishmentId, isParent);

  const establishments = convertWorkersWithCareCertificateStatus(rawEstablishments);

  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });

  addTitle(careCertificateTab);
  addTopTableHeader(careCertificateTab, columnsToDisplay);

  // addContentToCareCertificateTab(careCertificateTab, establishments, isParent);

  addFootNote(careCertificateTab);
};

const addTitle = (careCertificateTab) => {
  addText(careCertificateTab, 'B1:Z1', 'Care Certificates', { size: 24, bold: true });
  careCertificateTab.getCell('B1').alignment = { vertical: 'middle' };
  setColourForRange(careCertificateTab, 'A1:Z1', { backgroundColour: newBackgroundColours.lightGrey });
};

const addTopTableHeader = (tab, columnsToDisplay) => {
  const lastColumnLetter = colCache.n2l(1 + columnsToDisplay.length);

  const topHeaderRange = `B3:${lastColumnLetter}3`;
  applyStyleToRange(tab, topHeaderRange, tableHeaderCellStyle);
};
const addContentToCareCertificateTab = (careCertificateTab, establishments, isParent) => {
  // addHeading(careCertificateTab, 'B2', 'D2', 'Care Certificate');
  // addLine(careCertificateTab, 'A4', isParent ? 'E4' : 'D4');
  alignColumnToLeft(careCertificateTab, 2);
  if (isParent) alignColumnToLeft(careCertificateTab, 3);

  const careCertificateTable = createCareCertificateTable(careCertificateTab, isParent);
  addRowsToCareCertificateTable(careCertificateTable, establishments, isParent);

  fitColumnsToSize(careCertificateTab, 2, 5.5);
  addBordersToAllFilledCells(careCertificateTab, 5);
};

const createCareCertificateTable = (careCertificateTab, isParent) => {
  setTableHeadingsStyle(
    careCertificateTab,
    6,
    backgroundColours.blue,
    textColours.white,
    isParent ? ['B', 'C', 'D', 'E'] : ['B', 'C', 'D'],
  );

  isParent && columns.unshift({ name: 'Workplace', filterButton: true });

  return careCertificateTab.addTable({
    name: 'careCertificateTable',
    ref: 'B6',
    columns,
    rows: [],
  });
};

const addRowsToCareCertificateTable = (careCertificateTable, establishments, isParent) => {
  establishments.forEach((establishment) => {
    const { workers, establishmentName } = establishment;
    workers.forEach((worker) => {
      const { workerId, jobRole, status } = worker;
      const data = [workerId, jobRole, status];
      isParent && data.unshift(establishmentName);
      careCertificateTable.addRow(data);
    });
  });

  addBlankRowIfTableEmpty(careCertificateTable, isParent ? 4 : 3);
  careCertificateTable.commit();
};

const addFootNote = (tab) => {
  const footNoteText = ['Note, the data displayed in this table has been generated from staff records.'];

  tab.addRow([]);

  footNoteText.forEach((text) => {
    const newRow = tab.lastRow.number + 1;
    addText(tab, `B${newRow}`, text);
  });
};

module.exports.generateCareCertificateTab = generateCareCertificateTab;
module.exports.addContentToCareCertificateTab = addContentToCareCertificateTab;
