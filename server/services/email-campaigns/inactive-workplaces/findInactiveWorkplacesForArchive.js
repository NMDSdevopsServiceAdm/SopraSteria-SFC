const {
  getInactiveWorkplacesForArchive,
  refreshInactiveWorkplacesForArchive,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplacesForArchive');

const transformInactiveWorkplacesForArchive = (inactiveWorkplace) => {
  const name = inactiveWorkplace.NameValue;
  const ASCID = inactiveWorkplace.EstablishmentID;
  const Address1 = inactiveWorkplace.Address1;
  const Address2 = inactiveWorkplace.Address2;
  const Address3 = inactiveWorkplace.Address3;
  const Town = inactiveWorkplace.Town;
  const County = inactiveWorkplace.County;
  const PostCode = inactiveWorkplace.PostCode;

  return {
    name,
    ASCID,
    Address1,
    Address2,
    Address3,
    Town,
    County,
    PostCode,
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
