const nextEmail = require('./nextEmail');
const {
  getInactiveWorkplaces,
  refreshInactiveWorkplaces,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplaces');

const transformInactiveWorkplaces = (inactiveWorkplace) => {
  const { id, name } = nextEmail.getTemplate(inactiveWorkplace);

  return {
    id: inactiveWorkplace.EstablishmentID,
    name: inactiveWorkplace.NameValue,
    nmdsId: inactiveWorkplace.NmdsID,
    lastUpdated: inactiveWorkplace.LastUpdated,
    emailTemplate: {
      id,
      name,
    },
    dataOwner: inactiveWorkplace.DataOwner,
    user: {
      name: inactiveWorkplace.PrimaryUserName,
      email: inactiveWorkplace.PrimaryUserEmail,
    },
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
