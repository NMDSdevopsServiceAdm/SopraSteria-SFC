const nextEmail = require('./nextEmail');
const {
  getInactiveWorkplaces,
  refreshInactiveWorkplaces,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplaces');

const transformInactiveWorkplaces = (inactiveWorkplace) => {
  const id = inactiveWorkplace.EstablishmentID;
  const name = inactiveWorkplace.NameValue;
  const nmdsId = inactiveWorkplace.NmdsID;
  const lastLogin = inactiveWorkplace.LastLogin;
  const dataOwner = inactiveWorkplace.DataOwner;
  const emailTemplate = nextEmail.getTemplate(inactiveWorkplace);
  const user = {
    name: inactiveWorkplace.PrimaryUserName,
    email: inactiveWorkplace.PrimaryUserEmail,
  };

  return {
    id,
    name,
    nmdsId,
    lastLogin,
    emailTemplate,
    dataOwner,
    user,
  };
};

const findInactiveWorkplaces = async () => {
  await refreshInactiveWorkplaces();

  return (await getInactiveWorkplaces()).filter(nextEmail.shouldReceive).map(transformInactiveWorkplaces);
};

module.exports = {
  transformInactiveWorkplaces,
  findInactiveWorkplaces,
};
