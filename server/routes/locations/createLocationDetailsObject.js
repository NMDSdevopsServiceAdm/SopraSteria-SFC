const createLocationDetailsObject = (data) => {
  //Map DB fields to expected JSON output
  return {
    locationId: data.locationid,
    locationName: data.locationname,
    addressLine1: data.addressline1,
    addressLine2: data.addressline2,
    townCity: data.towncity,
    county: data.county,
    postalCode: data.postalcode,
    mainService: data.mainservice,
    isRegulated: data.isRegulated,
  };
};

module.exports.createLocationDetailsObject = createLocationDetailsObject;
