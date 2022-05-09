const { makeRowBold } = require('../../utils/excelUtils');

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

  makeRowBold(workplacesWithoutEmailTab, 1);
};

module.exports = {
  generateWorkplacesWithoutEmailTab,
  addContentToWorkplacesWithoutEmailTab,
};
