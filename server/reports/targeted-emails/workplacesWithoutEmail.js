const generateWorkplacesWithoutEmailTab = (workbook, workplacesWithoutEmail) => {
  const workplacesWithoutEmailTab = workbook.addWorksheet('Workplaces without Email');

  addContentToWorkplacesWithoutEmailTab(workplacesWithoutEmailTab, workplacesWithoutEmail);
};

const addContentToWorkplacesWithoutEmailTab = (workplacesWithoutEmailTab, workplacesWithoutEmail) => {
  addHeaders(workplacesWithoutEmailTab);

  for (const id of workplacesWithoutEmail) {
    workplacesWithoutEmailTab.addRow([id]);
  }
};

const addHeaders = (workplacesWithoutEmailTab) => {
  workplacesWithoutEmailTab.columns = [{ header: 'NMDS ID', key: 'nmdsId' }];

  const headerRow = workplacesWithoutEmailTab.getRow(1);
  headerRow.font = { bold: true, name: 'Calibri' };
};

module.exports = {
  generateWorkplacesWithoutEmailTab,
  addContentToWorkplacesWithoutEmailTab,
};
