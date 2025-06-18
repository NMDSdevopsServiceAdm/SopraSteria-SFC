const {
  getInactiveWorkplacesForDeletion,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplacesForDeletion');

const transformInactiveWorkplacesForDeletion = (inactiveWorkplace) => {
  const name = inactiveWorkplace.NameValue;
  const nmdsId = inactiveWorkplace.NmdsID;
  const establishmentID = inactiveWorkplace.EstablishmentID;
  const lastLogin = inactiveWorkplace.LastLogin;
  const lastUpdated = inactiveWorkplace.LastUpdated;
  const dataOwner = inactiveWorkplace.DataOwner;
  const address = formattedAddress(inactiveWorkplace);
  const locationId = inactiveWorkplace.LocationID;
  const parentNmdsId = inactiveWorkplace.ParentNmdsID;

  return {
    name,
    nmdsId,
    address,
    lastLogin,
    lastUpdated,
    dataOwner,
    establishmentID,
    locationId,
    parentNmdsId,
  };
};

const formattedAddress = (inactiveWorkplace) => {
  return [inactiveWorkplace.Address1, inactiveWorkplace.Town, inactiveWorkplace.County, inactiveWorkplace.PostCode]
    .filter((field) => !!field)
    .join(' ');
};

const findInactiveWorkplacesForDeletion = async () => {
  return (await getInactiveWorkplacesForDeletion()).map(transformInactiveWorkplacesForDeletion);
};

module.exports = {
  transformInactiveWorkplacesForDeletion,
  findInactiveWorkplacesForDeletion,
  formattedAddress,
};
