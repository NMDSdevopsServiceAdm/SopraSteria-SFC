const models = require('../../../../models');
const { convertWorkersWithCareCertificateStatus } = require('../../../../utils/trainingAndQualificationsUtils');
const { addContentToCareCertificateTab } = require('../careCertificateTab');

const generateCareCertificateTab = async (workbook, establishmentId) => {
  const rawWorkers = models.worker.getWorkersWithCareCertificates(establishmentId);
  const workers = convertWorkersWithCareCertificateStatus(rawWorkers);

  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });
  addContentToCareCertificateTab(careCertificateTab, workers);
};

module.exports.generateCareCertificateTab = generateCareCertificateTab;
