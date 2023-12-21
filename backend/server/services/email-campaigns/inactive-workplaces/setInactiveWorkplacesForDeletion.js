const {
  getInactiveWorkplacesForDeletion,
  refreshInactiveWorkplacesForDeletion,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplacesForDeletion');

const transformInactiveWorkplacesForDeletion = (inactiveWorkplace) => {
  const name = inactiveWorkplace.NameValue;
  const nmdsId = inactiveWorkplace.NmdsID;
  const establishmentID = inactiveWorkplace.EstablishmentID;
  const lastLogin = inactiveWorkplace.LastLogin;
  const lastUpdated = inactiveWorkplace.LastUpdated;
  const dataOwner = inactiveWorkplace.DataOwner;
  const address = formattedAddress(inactiveWorkplace);

  return {
    name,
    nmdsId,
    address,
    lastLogin,
    lastUpdated,
    dataOwner,
    establishmentID,
  };
};

const formattedAddress = (inactiveWorkplace) => {
  return [inactiveWorkplace.Address1, inactiveWorkplace.Town, inactiveWorkplace.County, inactiveWorkplace.PostCode]
    .filter((field) => !!field)
    .join(' ');
};

const findInactiveWorkplacesForDeletion = async () => {
  await refreshInactiveWorkplacesForDeletion();
  return (await getInactiveWorkplacesForDeletion()).map(transformInactiveWorkplacesForDeletion);
};

module.exports = {
  transformInactiveWorkplacesForDeletion,
  findInactiveWorkplacesForDeletion,
  formattedAddress,
};
