const { makeRowBold } = require('../../utils/excelUtils');

const generateWorkplacesToEmailTab = (workbook, workplacesToEmail) => {
  const workplacesToEmailTab = workbook.addWorksheet('Found Workplaces');

  addContentToWorkplacesToEmailTab(workplacesToEmailTab, workplacesToEmail);
};

const addContentToWorkplacesToEmailTab = (workplacesToEmailTab, workplacesToEmail) => {
  addHeaders(workplacesToEmailTab);

  workplacesToEmailTab.addRows(workplacesToEmail);
};

const addHeaders = (workplacesToEmailTab) => {
  workplacesToEmailTab.columns = [
    { header: 'NMDS ID', key: 'nmdsId' },
    { header: 'Email Address', key: 'emailAddress' },
  ];

  makeRowBold(workplacesToEmailTab, 1);
};

module.exports = {
  generateWorkplacesToEmailTab,
  addContentToWorkplacesToEmailTab,
};
