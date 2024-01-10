const express = require('express');
const router = express.Router();
const Authorization = require('../../../utils/security/isAuthenticated');
const models = require('../../../models/index');
const { createLocationDetailsObject, sendLocationsResponse } = require('../../../services/locations/locations');
const { isAdminRole } = require('../../../utils/adminUtils');

const adminGetCurrentEstablishment = async (req, locationID) => {
  const establishment = await models.establishment.findByPk(req.establishment.id, {
    attributes: ['NameValue', 'address1', 'address2', 'town', 'county', 'postcode', 'isRegulated'],
    include: [
      {
        model: models.services,
        as: 'mainService',
        attributes: ['name'],
      },
    ],
  });

  return {
    locationid: locationID,
    locationname: establishment.NameValue,
    addressline1: establishment.address1,
    addressline2: establishment.address2,
    towncity: establishment.town,
    county: establishment.county,
    postalcode: establishment.postcode,
    isRegulated: establishment.isRegulated,
    ...(establishment.mainService && { mainservice: establishment.mainService.name }),
  };
};

const getLocations = async (req, res, matching, locationID) => {
  let locationData = [];

  //Find matching location data
  const result = await models.location.findByLocationID(locationID);

  if (result != null) {
    const data = result.dataValues;

    locationData.push(createLocationDetailsObject(data));
  }

  // If the user is an Admin and the Location was not found, we want them to be able to use the location ID that they searched for.
  if (locationData.length === 0 && isAdminRole(req.role)) {
    const data = await adminGetCurrentEstablishment(req, locationID);

    locationData.push(createLocationDetailsObject(data));
  }

  if (matching) {
    const currentEstablishments = await models.establishment.findByLocationID(locationID);

    if (currentEstablishments.length > 0) {
      locationData = [];
    }
  }

  return sendLocationsResponse(res, locationData, 'locationID');
};

router.route('/:locationId');

router.route('/:locationId').get(async function (req, res) {
  await getLocations(req, res, false, req.params.locationId);
});

router.get('/matching/:locationId', Authorization.isAuthorised);
// GET Location API by locationId
router.route('/matching/:locationId').get(async function (req, res) {
  await getLocations(req, res, true, req.params.locationId);
});

module.exports = router;
module.exports.getLocations = getLocations;
