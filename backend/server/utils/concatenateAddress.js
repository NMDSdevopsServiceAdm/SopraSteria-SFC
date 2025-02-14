exports.concatenateAddress = function (addressLine1, addressLine2, addressLine3, townAndCity, county) {
  let concatAddress = '';

  if (addressLine1) concatAddress += addressLine1;
  if (addressLine2) concatAddress += ' ' + addressLine2;
  if (addressLine3) concatAddress += ' ' + addressLine3;
  if (townAndCity) concatAddress += ' ' + townAndCity;
  if (county) concatAddress += ' ' + county;

  return concatAddress;
};
