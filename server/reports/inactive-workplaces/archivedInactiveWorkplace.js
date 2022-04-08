const buildRow = (workplace) => {
  return {
    workplaceASCID: workplace.ASCID,
    workplaceName: workplace.name,
    address1: workplace.Address1,
    address2: workplace.Address2,
    address3: workplace.Address3,
    Town: workplace.Town,
    County: workplace.County,
    PostCode: workplace.PostCode,
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
    { header: 'Workplace Address1', key: 'address1' },
    { header: 'Workplace Address2', key: 'address2' },
    { header: 'Workplace Address3', key: 'address3' },
    { header: 'Workplace Town', key: 'Town' },
    { header: 'Workplace County', key: 'County' },
    { header: 'Workplace PostCode', key: 'PostCode' },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };

  return worksheet;
};

module.exports = {
  addWorksheet,
  buildRows,
};
