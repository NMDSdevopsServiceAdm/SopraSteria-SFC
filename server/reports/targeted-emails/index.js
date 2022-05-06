const excelUtils = require('../../utils/excelUtils');
const { generateWorkplacesToEmailTab } = require('./workplacesToEmail');

const generateTargetedEmailsReport = async (workbook, usersToEmail, establishmentNmdsIdList) => {
  generateWorkplacesToEmailTab(workbook, usersToEmail);
  //generateWorkplacesWithoutEmailTab(workbook, establishmentNmdsIdList);

  workbook.eachSheet((sheet) => {
    excelUtils.fitColumnsToSize(sheet);
  });

  return workbook;
};

module.exports = {
  generateTargetedEmailsReport,
};
