const models = require('../../../../models');
const {
  addHeading,
  addLine,
  alignColumnToLeft,
  addQuestion,
  backgroundColours,
  textColours,
  setTableHeadingsStyle,
  addBlankRowIfTableEmpty,
  fitColumnsToSize,
  addBordersToAllFilledCells,
} = require('../../../../utils/excelUtils');
const { convertWorkersWithCareCertificateStatus } = require('../../../../utils/trainingAndQualificationsUtils');

const generateCareCertificateTab = async (workbook, establishmentId) => {
  const rawEstablishmentWorkersCareCertificates = await models.establishment.getWorkersWithCareCertificateStatus(
    [establishmentId],
    true,
  );

  const establishmentWorkerCareCertificates = rawEstablishmentWorkersCareCertificates.map((establishment) => {
    const workersWithCareCertificates = convertWorkersWithCareCertificateStatus(establishment.workers);
    return {
      establishmentName: establishment.get('NameValue'),
      workers: workersWithCareCertificates,
    };
  });

  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });
  addContentToCareCertificateTab(careCertificateTab, establishmentWorkerCareCertificates);
};

const addContentToCareCertificateTab = (careCertificateTab, establishments) => {
  addHeading(careCertificateTab, 'B2', 'E2', 'Care Certificate');
  addLine(careCertificateTab, 'A4', 'E4');
  alignColumnToLeft(careCertificateTab, 2);
  addQuestion(careCertificateTab, 'B6', 'E6', 'Have they started or completed the Care Certificate?');

  const careCertificateTable = createCareCertificateTable(careCertificateTab);
  addRowsToCareCertificateTable(careCertificateTable, establishments);

  fitColumnsToSize(careCertificateTab, 2, 5.5);
  addBordersToAllFilledCells(careCertificateTab, 9);
};

const createCareCertificateTable = (careCertificateTab) => {
  setTableHeadingsStyle(careCertificateTab, 9, backgroundColours.blue, textColours.white, ['B', 'C', 'D', 'E']);

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
};

const addRowsToCareCertificateTable = (careCertificateTable, establishments) => {
  establishments.forEach((establishment) => {
    const { workers, establishmentName } = establishment;
    workers.forEach((worker) => {
      const { workerId, jobRole, status } = worker;
      careCertificateTable.addRow([establishmentName, workerId, jobRole, status]);
    });
  });

  addBlankRowIfTableEmpty(careCertificateTable, 4);
  careCertificateTable.commit();
};
module.exports.generateCareCertificateTab = generateCareCertificateTab;
module.exports.addContentToCareCertificateTab = addContentToCareCertificateTab;
