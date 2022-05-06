const generateWorkplacesToEmailTab = (workbook, usersToEmail) => {
  const workplacesToEmailTab = workbook.addWorksheet('Found Workplaces');

  addContentToWorkplacesToEmailTab(workplacesToEmailTab, usersToEmail);
};

const addContentToWorkplacesToEmailTab = (workplacesToEmailTab, usersToEmail) => {
  addHeaders(workplacesToEmailTab);
  const rows = buildRows(usersToEmail);
  workplacesToEmailTab.addRows(rows);
};

const addHeaders = (workplacesToEmailTab) => {
  workplacesToEmailTab.columns = [
    { header: 'NMDS ID', key: 'nmdsId' },
    { header: 'Email Address', key: 'emailAddress' },
  ];

  const headerRow = workplacesToEmailTab.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };
};

const buildRows = (usersToEmail) => {
  return usersToEmail.map(buildRow);
};

const buildRow = (user) => {
  return {
    nmdsId: user.establishment.nmdsId,
    emailAddress: user.get('email'),
  };
};

module.exports = {
  generateWorkplacesToEmailTab,
  addContentToWorkplacesToEmailTab,
};
