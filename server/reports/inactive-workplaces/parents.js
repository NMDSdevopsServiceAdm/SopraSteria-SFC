const buildRow = (workplace) => {
  return {
    workplace: workplace.name,
    workplaceId: workplace.nmdsId,
    lastUpdated: workplace.lastUpdated,
    emailTemplate: workplace.emailTemplate.name,
    dataOwner: workplace.dataOwner,
    nameOfUser: workplace.user.name,
    userEmail: workplace.user.email,
    totalSubs: workplace.subsidiaries.length,
  };
};

const buildRows = (parentWorkplaces) => {
  return parentWorkplaces.map(buildRow);
};

const addWorksheet = (workbook) => {
  const worksheet = workbook.addWorksheet('Parent workplaces');
  worksheet.columns = [
    { header: 'Workplace name', key: 'workplace' },
    { header: 'Workplace ID', key: 'workplaceId' },
    { header: 'Date last updated', key: 'lastUpdated' },
    { header: 'Email template', key: 'emailTemplate' },
    { header: 'Data owner', key: 'dataOwner' },
    { header: 'Name of user', key: 'nameOfUser' },
    { header: 'User email', key: 'userEmail' },
    { header: 'Total inactive subsidiaries', key: 'totalSubs' },
  ];

  const parentHeaderRow = worksheet.getRow(1);
  parentHeaderRow.font = { bold: true, name: 'Calibri' };

  return worksheet;
};

module.exports = {
  addWorksheet,
  buildRows,
};
