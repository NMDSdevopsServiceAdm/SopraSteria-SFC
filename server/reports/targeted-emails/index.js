const excelUtils = require('../../utils/excelUtils');
const { generateWorkplacesToEmailTab } = require('./workplacesToEmail');

const generateTargetedEmailsReport = async (workbook, users, establishmentNmdsIdList) => {
  const workplacesToEmail = formatWorkplacesToEmail(users);

  generateWorkplacesToEmailTab(workbook, workplacesToEmail);
  //generateWorkplacesWithoutEmailTab(workbook, establishmentNmdsIdList);

  workbook.eachSheet((sheet) => {
    excelUtils.fitColumnsToSize(sheet);
  });

  return workbook;
};

const formatWorkplacesToEmail = (users) => {
  return users.map(formatWorkplace);
};

const formatWorkplace = (user) => {
  return {
    nmdsId: user.establishment.nmdsId,
    emailAddress: user.get('email'),
  };
};

module.exports = {
  generateTargetedEmailsReport,
  formatWorkplacesToEmail,
};
