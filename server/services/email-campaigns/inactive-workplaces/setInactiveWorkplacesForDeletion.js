const {
  getInactiveWorkplacesForDeletion,
  refreshInactiveWorkplacesForDeletion,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplacesForDeletion');

const transformInactiveWorkplacesForDeletion = (inactiveWorkplace) => {
  const name = inactiveWorkplace.NameValue;
  const nmdsId = inactiveWorkplace.NmdsID;
  const establishmentID = inactiveWorkplace.EstablishmentID;
  const address = formattedAddress(inactiveWorkplace);
  return {
    name,
    nmdsId,
    address,
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
