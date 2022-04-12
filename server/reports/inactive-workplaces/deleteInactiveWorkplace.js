const findInactiveWorkplacesForDeletion = require('../../services/email-campaigns/inactive-workplaces/findInactiveWorkplacesForDeletion');

const buildRow = (workplace) => {
  return {
    workplaceAscId: workplace.ascId,
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
    { header: 'Workplace Id', key: 'workplaceAscId' },
    { header: 'Workplace name', key: 'workplaceName' },
    { header: 'Workplace Address', key: 'address' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  return worksheet;
};

const generateInactiveWorkplacesForDeletionTab = async (workbook) => {
  const inactiveWorkplacesForDeletion = await findInactiveWorkplacesForDeletion.findInactiveWorkplacesForDeletion();

  const archivedInactiveWorkplacesWorksheet = addWorksheet(workbook);
  const inactiveWorkplacesTobeDeletedRows = buildRows(inactiveWorkplacesForDeletion);
  archivedInactiveWorkplacesWorksheet.addRows(inactiveWorkplacesTobeDeletedRows);
};

module.exports = {
  generateInactiveWorkplacesForDeletionTab,
  addWorksheet,
  buildRows,
};
