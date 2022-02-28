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
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateCareCertificateTab = async (workbook, establishmentId, isParent = false) => {
  const rawEstablishments = await models.establishment.getWorkersWithCareCertificateStatus(establishmentId, isParent);

  const establishments = convertWorkersWithCareCertificateStatus(rawEstablishments);
  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });
  addContentToCareCertificateTab(careCertificateTab, establishments, isParent);
};

const addContentToCareCertificateTab = (careCertificateTab, establishments, isParent) => {
  addHeading(careCertificateTab, 'B2', 'D2', 'Care Certificate', textColours.blue, 16);
  addLine(careCertificateTab, 'A4', isParent ? 'E4' : 'D4');
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

  const columns = [
    { name: 'Worker ID', filterButton: true },
    { name: 'Job role', filterButton: true },
    { name: 'Status', filterButton: true },
  ];

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

module.exports.generateCareCertificateTab = generateCareCertificateTab;
module.exports.addContentToCareCertificateTab = addContentToCareCertificateTab;
