const setInactiveWorkplaces = require('../../services/email-campaigns/inactive-workplaces/setInactiveWorkplaces');

const buildRow = (workplace) => {
  return {
    workplace: workplace.name,
    workplaceId: workplace.nmdsId,
    lastLogin: workplace.lastLogin,
    lastUpdated: workplace.lastUpdated,
    emailTemplate: workplace.emailTemplate.name,
    dataOwner: workplace.dataOwner,
    nameOfUser: workplace.user.name,
    userEmail: workplace.user.email,
  };
};

const buildRows = (workplaces) => {
  return workplaces.map(buildRow);
};

const addWorksheet = (workbook) => {
  const worksheet = workbook.addWorksheet('Inactive workplaces');
  worksheet.columns = [
    { header: 'Workplace name', key: 'workplace' },
    { header: 'Workplace ID', key: 'workplaceId' },
    { header: 'Date last logged in', key: 'lastLogin', style: { numFmt: 'dd/mm/yyyy' } },
    { header: 'Date last updated', key: 'lastUpdated', style: { numFmt: 'dd/mm/yyyy' } },
    { header: 'Email template', key: 'emailTemplate' },
    { header: 'Data owner', key: 'dataOwner' },
    { header: 'Name of user', key: 'nameOfUser' },
    { header: 'User email', key: 'userEmail' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  return worksheet;
};

const generateInactiveWorkplacesTab = async (workbook) => {
  const inactiveWorkplaces = await setInactiveWorkplaces.findInactiveWorkplaces();
  const inactiveWorksheet = addWorksheet(workbook);
  const inactiveWorkplaceRows = buildRows(inactiveWorkplaces);
  inactiveWorksheet.addRows(inactiveWorkplaceRows);
};

module.exports = {
  generateInactiveWorkplacesTab,
  addWorksheet,
  buildRows,
};
