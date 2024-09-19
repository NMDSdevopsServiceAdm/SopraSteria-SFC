const nextEmail = require('./nextEmail');
const { getInactiveWorkplaces } = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplaces');
const { refreshEstablishmentLastActivityView } = require('../../../utils/db/inactiveWorkplacesUtils');

const transformInactiveWorkplaces = (inactiveWorkplace) => {
  const id = inactiveWorkplace.EstablishmentID;
  const name = inactiveWorkplace.NameValue;
  const nmdsId = inactiveWorkplace.NmdsID;
  const lastLogin = inactiveWorkplace.LastLogin;
  const lastUpdated = inactiveWorkplace.LastUpdated;
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
    lastUpdated,
    emailTemplate,
    dataOwner,
    user,
  };
};

const findInactiveWorkplaces = async () => {
  await refreshEstablishmentLastActivityView();

  return (await getInactiveWorkplaces()).filter(nextEmail.shouldReceive).map(transformInactiveWorkplaces);
};

module.exports = {
  transformInactiveWorkplaces,
  findInactiveWorkplaces,
};
