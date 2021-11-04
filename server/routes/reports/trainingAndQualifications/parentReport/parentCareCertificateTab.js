const models = require('../../../../models');
const { addHeading, addLine, alignColumnToLeft, addQuestion, backgroundColours, textColours, setTableHeadingsStyle } = require('../../../../utils/excelUtils');
const { convertWorkersWithCareCertificateStatus } = require('../../../../utils/trainingAndQualificationsUtils');

const generateCareCertificateTab = async (workbook, establishmentId) => {
  const rawWorkers = await models.establishment.getWorkersWithCareCertificateStatus([establishmentId]);
  const workers = convertWorkersWithCareCertificateStatus(rawWorkers[0].workers);

  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });
  addContentToCareCertificateTab(careCertificateTab, workers);
};

const addContentToCareCertificateTab = (careCertificateTab, workers) => {
  addHeading(careCertificateTab, 'B2', 'E2', 'Care Certificate');
  addLine(careCertificateTab, 'A4', 'E4');
  alignColumnToLeft(careCertificateTab, 2);
  addQuestion(careCertificateTab, 'B6', 'E6', 'Have they started or completed the Care Certificate?');

  const careCertificateTable = createCareCertificateTable(careCertificateTab);
};

const createCareCertificateTable = careCertificateTab => {
  setTableHeadingsStyle(careCertificateTab, 6, backgroundColours.blue, textColours.white, ['B', 'C', 'D', 'E']);

  return careCertificateTab.addTable({
    name: 'careCertificateTable',
    ref: 'B9',
    columns: [
      { name: 'Workplace', filterButton: true },
      { name: 'Worker ID', filterButton: true },
      { name: 'Job role', filterButton: true },
      { name: 'Status', filterButton: true },
    ],
    rows: [],
  });
}

module.exports.generateCareCertificateTab = generateCareCertificateTab;
module.exports.addContentToCareCertificateTab = addContentToCareCertificateTab;
