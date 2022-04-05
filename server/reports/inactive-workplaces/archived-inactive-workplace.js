const addWorksheet = (workbook) => {
  const worksheet = workbook.addWorksheet('ArchivedInactiveWorkplaces');
  worksheet.columns = [
    { header: 'Workplace name', key: 'workplace' },
    { header: 'Workplace ID', key: 'workplaceId' },
    { header: 'Address', key: 'WorkplaceAddress' },
  ];
};
