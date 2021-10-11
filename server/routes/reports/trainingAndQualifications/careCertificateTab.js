const { convertWorkerWithCareCertificate } = require('../../../utils/trainingAndQualificationsUtils');
const {
  addHeading,
  addLine,
  setTableHeadingsStyle,
  backgroundColours,
  textColours,
  addBordersToAllFilledCells,
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateCareCertificateTab = async (workbook, establishmentId) => {
  const getWorkerWithCareCertificate = await models.worker.careCertificate(establishmentId);
  const workersWithCareCertificate = convertWorkerWithCareCertificate(getWorkerWithCareCertificate);

  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });
  addContentToCareCertificateTab(careCertificateTab, workersWithCareCertificate);
};

const addContentToCareCertificateTab = (careCertificateTab, workersWithCareCertificate) => {
  addHeading(careCertificateTab, 'B2', 'E2', 'Care Certificate');
  addLine(careCertificateTab, 'A4', 'D4');
  addHeading(careCertificateTab, 'B6', 'D6', 'Have they started or completed the Care Certificate?');
  careCertificateTab.getCell('B6').font = {
    family: 4,
    size: 19,
    bold: true,
    color: { argb: '000000' },
  };

  careCertificateTab.autoFilter = 'B9:D9';
  careCertificateTab.autoFilter = {
    from: 'B9',
    to: 'D9',
  };

  const careCertificateTable = createCareCertificateTable(careCertificateTab);
  addRowsTocareCertificateTable(careCertificateTable, workersWithCareCertificate);
  addBordersToAllFilledCells(careCertificateTab, 8);
};

const createCareCertificateTable = (careCertificateTab) => {
  setTableHeadingsStyle(careCertificateTab, 9, backgroundColours.blue, textColours.white, ['B', 'C', 'D']);

  return careCertificateTab.addTable({
    name: 'careCertificate',
    ref: 'B9',
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
