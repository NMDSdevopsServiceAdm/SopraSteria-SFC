const { addHeading, addLine } = require('../../../utils/excelUtils');

const generateCareCertificateTab = async (workbook) => {
  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });
  addContentToCareCertificateTab(careCertificateTab);
};

const addContentToCareCertificateTab = (careCertificateTab) => {
  addHeading(careCertificateTab, 'B2', 'E2', 'Care Certificate');
  addLine(careCertificateTab, 'A4', 'H4');
  addHeading(careCertificateTab, 'B6', 'H6', 'Have they started or completed the Care Certificate?');
};

module.exports.generateCareCertificateTab = generateCareCertificateTab;
module.exports.addContentToCareCertificateTab = addContentToCareCertificateTab;
