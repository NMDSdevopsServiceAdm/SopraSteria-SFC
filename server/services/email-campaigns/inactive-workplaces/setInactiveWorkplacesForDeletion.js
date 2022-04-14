const {
  getInactiveWorkplacesForDeletion,
  refreshInactiveWorkplacesForDeletion,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplacesForDeletion');

const transformInactiveWorkplacesForDeletion = (inactiveWorkplace) => {
  const name = inactiveWorkplace.NameValue;
  const ascId = inactiveWorkplace.EstablishmentID;
  const address = formattedAddress(inactiveWorkplace);
  return {
    name,
    ascId,
    address,
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
