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
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateCareCertificateTab = async (workbook, establishmentId) => {
  const rawWorkers = await models.worker.getWorkersWithCareCertificateStatus(establishmentId);
  const workers = convertWorkersWithCareCertificateStatus(rawWorkers);

  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });
  addContentToCareCertificateTab(careCertificateTab, workers);
};

const addContentToCareCertificateTab = (careCertificateTab, workers) => {
  addHeading(careCertificateTab, 'B2', 'D2', 'Care Certificate');
  addLine(careCertificateTab, 'A4', 'D4');
  alignColumnToLeft(careCertificateTab, 2);

  const careCertificateTable = createCareCertificateTable(careCertificateTab);
  addRowsToCareCertificateTable(careCertificateTable, workers);

  fitColumnsToSize(careCertificateTab, 2);
  addBordersToAllFilledCells(careCertificateTab, 5);
};

const createCareCertificateTable = (careCertificateTab) => {
  setTableHeadingsStyle(careCertificateTab, 6, backgroundColours.blue, textColours.white, ['B', 'C', 'D']);

  return careCertificateTab.addTable({
    name: 'careCertificateTable',
    ref: 'B6',
    columns: [
      { name: 'Worker ID', filterButton: true },
      { name: 'Job role', filterButton: true },
      { name: 'Status', filterButton: true },
    ],
    rows: [],
  });
};

const addRowsToCareCertificateTable = (careCertificateTable, workers) => {
  for (let worker of workers) {
    careCertificateTable.addRow([worker.workerId, worker.jobRole, worker.status]);
  }

  careCertificateTable.commit();
};

module.exports.generateCareCertificateTab = generateCareCertificateTab;
module.exports.addContentToCareCertificateTab = addContentToCareCertificateTab;
