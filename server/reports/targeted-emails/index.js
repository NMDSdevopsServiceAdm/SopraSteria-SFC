const excelUtils = require('../../utils/excelUtils');
const { generateWorkplacesToEmailTab } = require('./workplaces-to-email');

const generateTargetedEmailsReport = async (workbook, usersToEmail, establishmentNmdsIdList) => {
  console.log(usersToEmail);
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
