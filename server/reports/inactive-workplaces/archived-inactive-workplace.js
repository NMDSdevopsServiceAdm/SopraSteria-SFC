const buildRow = (workplaceForDeleting) => {
  return {
    workplace: workplaceForDeleting.name,
    workplaceId: workplaceForDeleting.nmdsId,
    workplaceAddress: workplaceForDeleting.workplaceAddress,
  };
};

const buildRows = (workplacesForDeleting) => {
  return workplacesForDeleting.map(buildRow);
};

const addWorksheet = (workbook) => {
  const worksheet = workbook.addWorksheet('ArchivedInactiveWorkplaces');
  worksheet.columns = [
    { header: 'Workplace name', key: 'workplace' },
    { header: 'Workplace ID', key: 'workplaceId' },
    { header: 'Address', key: 'WorkplaceAddress' },
  ];
  return worksheet;
};

module.exports = {
  addWorksheet,
  buildRows,
};
