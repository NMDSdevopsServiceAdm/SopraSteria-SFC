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
  addQuestion,
} = require('../../../utils/excelUtils');
const models = require('../../../models');

const generateCareCertificateTab = async (workbook, establishmentId, isParent = false) => {
  const rawEstablishments = await models.establishment.getWorkersWithCareCertificateStatus(establishmentId, isParent);
  const establishments = rawEstablishments.map((rawEstablishment) => {
    return {
      establishmentName: rawEstablishment.get('NameValue'),
      workers: convertWorkersWithCareCertificateStatus(rawEstablishment.workers),
    };
  });

  const careCertificateTab = workbook.addWorksheet('Care Certificate', { views: [{ showGridLines: false }] });
  addContentToCareCertificateTab(careCertificateTab, establishments, isParent);
};

const addContentToCareCertificateTab = (careCertificateTab, establishments, isParent) => {
  addHeading(careCertificateTab, 'B2', 'D2', 'Care Certificate');
  addLine(careCertificateTab, 'A4', 'D4');
  alignColumnToLeft(careCertificateTab, 2);

  isParent && addQuestion(careCertificateTab, 'B6', 'E6', 'Have they started or completed the Care Certificate?');

  const careCertificateTable = createCareCertificateTable(careCertificateTab, isParent);
  addRowsToCareCertificateTable(careCertificateTable, establishments, isParent);

  fitColumnsToSize(careCertificateTab, 2, 5.5);
  addBordersToAllFilledCells(careCertificateTab, isParent ? 9 : 5);
};

const createCareCertificateTable = (careCertificateTab, isParent) => {
  setTableHeadingsStyle(
    careCertificateTab,
    isParent ? 9 : 6,
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
    ref: isParent ? 'B9' : 'B6',
    columns,
    rows: [],
  });
};

const addRowsToCareCertificateTable = (careCertificateTable, establishments, isParent) => {
  establishments.forEach((establishment) => {
    const { workers, establishmentName } = establishment;
    workers.forEach((worker) => {
      const { workerId, jobRole, status } = worker;
      const data = isParent ? [establishmentName, workerId, jobRole, status] : [workerId, jobRole, status];
      careCertificateTable.addRow(data);
    });
  });

  addBlankRowIfTableEmpty(careCertificateTable, 3);
  careCertificateTable.commit();
};

module.exports.generateCareCertificateTab = generateCareCertificateTab;
module.exports.addContentToCareCertificateTab = addContentToCareCertificateTab;
