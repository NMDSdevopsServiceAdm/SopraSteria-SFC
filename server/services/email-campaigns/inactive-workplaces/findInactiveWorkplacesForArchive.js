const {
  getInactiveWorkplacesForArchive,
  refreshInactiveWorkplacesForArchive,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplacesForArchive');

const transformInactiveWorkplacesForArchive = (inactiveWorkplace) => {
  const name = inactiveWorkplace.NameValue;
  const ASCID = inactiveWorkplace.EstablishmentID;
  const Address1 = inactiveWorkplace.Address1;

  return {
    name,
    ASCID,
    Address1,
  };
};

const findInactiveWorkplacesForArchive = async () => {
  await refreshInactiveWorkplacesForArchive();

  return (await getInactiveWorkplacesForArchive()).map(transformInactiveWorkplacesForArchive);
};

module.exports = {
  transformInactiveWorkplacesForArchive,
  findInactiveWorkplacesForArchive,
};
