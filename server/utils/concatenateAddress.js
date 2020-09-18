exports.concatenateAddress = function (addressLine1, addressLine2, townAndCity, county) {
  //Remove whitespaces and any non alphanumeric characters and then cast to upper case.
  let concatAddress = '';

  if (addressLine1) concatAddress += addressLine1;
  if (addressLine2) concatAddress += ' ' + addressLine2;
  if (townAndCity) concatAddress += ' ' + townAndCity;
  if (county) concatAddress += ' ' + county;

  return concatAddress;
};
