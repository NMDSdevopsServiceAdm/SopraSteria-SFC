const {
  getInactiveWorkplacesForArchive,
  refreshInactiveWorkplacesForArchive,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplacesForArchive');

const transformInactiveWorkplacesForArchive = (inactiveWorkplace) => {
  const name = inactiveWorkplace.NameValue;
  const ASCID = inactiveWorkplace.EstablishmentID;
  const Address1 = inactiveWorkplace.Address1;
  const Town = inactiveWorkplace.Town ?? '';
  const County = inactiveWorkplace.County ?? '';
  const PostCode = inactiveWorkplace.PostCode;
  const Address = Address1 + '  ' + Town + '  ' + County + '  ' + PostCode;
  return {
    name,
    ASCID,
    Address,
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
