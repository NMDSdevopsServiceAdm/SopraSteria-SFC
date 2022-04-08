const {
  getInactiveWorkplacesForArchive,
  refreshInactiveWorkplacesForArchive,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplacesForArchive');

const transformInactiveWorkplacesForArchive = (inactiveWorkplace) => {
  const name = inactiveWorkplace.NameValue;
  const ASCID = inactiveWorkplace.EstablishmentID;
  const Address1 = inactiveWorkplace.Address1;
  // const Address2 = Address1 ?? inactiveWorkplace.Address2;
  // const Address3 = Address2 ?? inactiveWorkplace.Address3;
  const Town = inactiveWorkplace.Town ?? '';
  const County = inactiveWorkplace.County ?? '';
  const PostCode = inactiveWorkplace.PostCode;
  const Address = Address1 + '  ' + Town + '  ' + County + '  ' + PostCode;
  // console.log(Address1, Address2, Address3, Town, County, PostCode);
  return {
    name,
    ASCID,
    Address,
  };
};

const findInactiveWorkplacesForArchive = async () => {
  await refreshInactiveWorkplacesForArchive();
  console.log('****************');
  console.log((await getInactiveWorkplacesForArchive()).map(transformInactiveWorkplacesForArchive));

  return (await getInactiveWorkplacesForArchive()).map(transformInactiveWorkplacesForArchive);
};

module.exports = {
  transformInactiveWorkplacesForArchive,
  findInactiveWorkplacesForArchive,
};
