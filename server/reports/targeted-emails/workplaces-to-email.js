const generateWorkplacesToEmailTab = (workbook, usersToEmail) => {
  const workplacesToEmailTab = addWorksheet(workbook);
  const rows = buildRows(usersToEmail);
  workplacesToEmailTab.addRows(rows);
};

const addWorksheet = (workbook) => {
  const worksheet = workbook.addWorksheet('Found Workplaces');
  worksheet.columns = [
    { header: 'NMDS ID', key: 'nmdsId' },
    { header: 'Email Address', key: 'emailAddress' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  return worksheet;
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
};
