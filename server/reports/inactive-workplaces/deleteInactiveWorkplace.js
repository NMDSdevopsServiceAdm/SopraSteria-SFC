const setInactiveWorkplacesForDeletion = require('../../services/email-campaigns/inactive-workplaces/setInactiveWorkplacesForDeletion');

const buildRow = (workplace) => {
  return {
    workplaceNmdsId: workplace.nmdsId,
    workplaceName: workplace.name,
    address: workplace.address,
  };
};

const buildRows = (workplaces) => {
  return workplaces.map(buildRow);
};

const addWorksheet = (workbook) => {
  const worksheet = workbook.addWorksheet('Workplaces to be deleted');
  worksheet.columns = [
    { header: 'Workplace NmdsId', key: 'workplaceNmdsId' },
    { header: 'Workplace name', key: 'workplaceName' },
    { header: 'Workplace Address', key: 'address' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  return worksheet;
};

const generateInactiveWorkplacesForDeletionTab = async (workbook) => {
  const inactiveWorkplacesForDeletion = await setInactiveWorkplacesForDeletion.findInactiveWorkplacesForDeletion();

  const archivedInactiveWorkplacesWorksheet = addWorksheet(workbook);
  const inactiveWorkplacesTobeDeletedRows = buildRows(inactiveWorkplacesForDeletion);
  archivedInactiveWorkplacesWorksheet.addRows(inactiveWorkplacesTobeDeletedRows);
};

module.exports = {
  generateInactiveWorkplacesForDeletionTab,
  addWorksheet,
  buildRows,
};
