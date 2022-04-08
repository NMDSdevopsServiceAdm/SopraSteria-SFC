const buildRow = (workplace) => {
  return {
    workplaceASCID: workplace.ASCID,
    workplaceName: workplace.name,
    address: workplace.Address,
  };
};

const buildRows = (workplaces) => {
  return workplaces.map(buildRow);
};

const addWorksheet = (workbook) => {
  const worksheet = workbook.addWorksheet('Inactive workplaces to be deleted');
  worksheet.columns = [
    { header: 'Workplace Id', key: 'workplaceASCID' },
    { header: 'Workplace name', key: 'workplaceName' },
    { header: 'Workplace Address', key: 'address' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  return worksheet;
};

module.exports = {
  addWorksheet,
  buildRows,
};
