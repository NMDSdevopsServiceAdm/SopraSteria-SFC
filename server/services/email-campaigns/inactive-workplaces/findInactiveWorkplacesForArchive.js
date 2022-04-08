const {
  getInactiveWorkplacesForArchive,
  refreshInactiveWorkplacesForArchive,
} = require('../../../models/email-campaigns/inactive-workplaces/getInactiveWorkplacesForArchive');

const transformInactiveWorkplacesForArchive = (inactiveWorkplace) => {
  const name = inactiveWorkplace.NameValue;
  const ascId = inactiveWorkplace.EstablishmentID;
  const Address1 = inactiveWorkplace.Address1;
  const Town = inactiveWorkplace.Town;
  const County = inactiveWorkplace.County;
  const PostCode = inactiveWorkplace.PostCode;
  const address = Address1 + '  ' + Town + '  ' + County + '  ' + PostCode;
  return {
    name,
    ascId,
    address,
  };
};

// const formattedAddress = (inactiveWorkplace) => {
//   return (
//     inactiveWorkplace.Address1 +
//     '  ' +
//     inactiveWorkplace.Town ?? '' +
//     '  ' +
//     inactiveWorkplace.County ?? '' +
//     '  ' +
//     inactiveWorkplace.PostCode
//   );
// };

const findInactiveWorkplacesForArchive = async () => {
  await refreshInactiveWorkplacesForArchive();
  return (await getInactiveWorkplacesForArchive()).map(transformInactiveWorkplacesForArchive);
};

module.exports = {
  transformInactiveWorkplacesForArchive,
  findInactiveWorkplacesForArchive,
};
