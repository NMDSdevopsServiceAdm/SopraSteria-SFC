const buildRow = (workplace) => {
  return {
    workplaceASCID: workplace.ASCID,
    workplaceName: workplace.name,
    address1: workplace.Address1,
  };
};

const buildRows = (workplaces) => {
  return workplaces.map(buildRow);
};

const addWorksheet = (workbook) => {
  const worksheet = workbook.addWorksheet('ArchivedInactiveWorkplaces');
  worksheet.columns = [
    { header: 'Workplace ASC-ID', key: 'workplaceASCID' },
    { header: 'Workplace name', key: 'workplaceName' },
    { header: 'Workplace Address', key: 'address1' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  return worksheet;
};

module.exports = {
  addWorksheet,
  buildRows,
};
