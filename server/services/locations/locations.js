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

const sendLocationsResponse = (res, locationData, searchmethod) => {
  if (locationData.length === 0) {
    res.status(404);
    return res.json({
      success: 0,
      message: 'No location found',
      searchmethod,
    });
  } else {
    res.status(200);
    return res.json({
      success: 1,
      message: 'Location Found',
      locationdata: locationData,
      searchmethod,
    });
  }
};

module.exports.createLocationDetailsObject = createLocationDetailsObject;
module.exports.sendLocationsResponse = sendLocationsResponse;
