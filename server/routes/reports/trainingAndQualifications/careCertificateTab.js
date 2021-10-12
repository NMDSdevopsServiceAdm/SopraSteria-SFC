const { convertWorkerWithCareCertificate } = require('../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  setTableHeadingsStyle,
  backgroundColours,
  textColours,
  addBordersToAllFilledCells,
  fitColumnsToSize,
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateCareCertificateTab = async (workbook, establishmentId) => {
  const getWorkerWithCareCertificate = await models.worker.careCertificate(establishmentId);
  const workersWithCareCertificate = convertWorkerWithCareCertificate(getWorkerWithCareCertificate);

  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });
  addContentToCareCertificateTab(careCertificateTab, workersWithCareCertificate);
};

const addContentToCareCertificateTab = (careCertificateTab, workersWithCareCertificate) => {
  addHeading(careCertificateTab, 'B2', 'D2', 'Care Certificate');
  addLine(careCertificateTab, 'A4', 'D4');

  careCertificateTab.autoFilter = 'B6:D6';
  careCertificateTab.autoFilter = {
    from: 'B6',
    to: 'D6',
  };

  const careCertificateTable = createCareCertificateTable(careCertificateTab);
  addRowsTocareCertificateTable(careCertificateTable, workersWithCareCertificate);
  fitColumnsToSize(careCertificateTab, 2);
  addBordersToAllFilledCells(careCertificateTab, 5);
};

const createCareCertificateTable = (careCertificateTab) => {
  setTableHeadingsStyle(careCertificateTab, 6, backgroundColours.blue, textColours.white, ['B', 'C', 'D']);

  return careCertificateTab.addTable({
    name: 'careCertificate',
    ref: 'B6',
    headerRow: true,

    columns: [
      { name: 'Woker ID', filterButton: true },
      { name: 'Job role', filterButton: true },
      { name: 'Status', filterButton: true },
    ],
    rows: [],
  });
};

const addRowsTocareCertificateTable = (careCertificateTable, workers) => {
  for (let worker of workers) {
    addRow(careCertificateTable, worker);
  }

  careCertificateTable.commit();
};

const addRow = (careCertificateTable, worker) => {
  careCertificateTable.addRow([worker.workerId, worker.jobRole, worker.status]);
};
module.exports.generateCareCertificateTab = generateCareCertificateTab;
module.exports.addContentToCareCertificateTab = addContentToCareCertificateTab;
