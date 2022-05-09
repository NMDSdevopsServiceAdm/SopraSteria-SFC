const excelUtils = require('../../utils/excelUtils');
const { generateWorkplacesToEmailTab } = require('./workplacesToEmail');
const { generateWorkplacesWithoutEmailTab } = require('./workplacesWithoutEmail');

const generateTargetedEmailsReport = async (workbook, users, establishmentNmdsIdList) => {
  const workplacesToEmail = formatWorkplacesToEmail(users);
  const workplacesWithoutEmail = getWorkplacesWithoutEmail(workplacesToEmail, establishmentNmdsIdList);

  generateWorkplacesToEmailTab(workbook, workplacesToEmail);
  //generateWorkplacesWithoutEmailTab(workbook, workplacesWithoutEmail);

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

const getWorkplacesWithoutEmail = (workplacesToEmail, establishmentNmdsIdList) => {
  return establishmentNmdsIdList.filter((id) => workplacesToEmail.find((workplace) => workplace.nmdsId === id));
};

module.exports = {
  generateTargetedEmailsReport,
  formatWorkplacesToEmail,
  getWorkplacesWithoutEmail,
};
