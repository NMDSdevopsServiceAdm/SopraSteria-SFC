const express = require('express');
const router = express.Router();
const Authorization = require('../../../utils/security/isAuthenticated');
const models = require('../../../models/index');
const pCodeCheck = require('../../../utils/postcodeSanitizer');
const { createLocationDetailsObject, sendLocationsResponse } = require('../../../services/locations/locations');

const removeMatchingLocations = async (locationIds, locationData) => {
  const currentEstablishments = await models.establishment.findEstablishmentsByLocationID(locationIds);

  if (currentEstablishments.length > 0) {
    locationData.map((location, index) => {
      currentEstablishments.map((establishment) => {
        if (location.locationId === establishment.locationId) {
          locationData.splice(index, 1);
        }
      });
    });
  }
};

const getLocationsByPostcode = async (_req, res, matching, postcode) => {
  let locationData = [];

  let locationIds = [];
  //Clean user submitted postcode
  let cleanPostcode = pCodeCheck.sanitisePostcode(postcode);

  if (cleanPostcode != null) {
    //Find matching postcode data
    let results = await models.location.findByPostcode(cleanPostcode);

    for (let i = 0, len = results.length; i < len; i++) {
      let data = results[i].dataValues;
      locationData.push(createLocationDetailsObject(data));
      locationIds.push(data.locationid);
    }
    if (matching) {
      await removeMatchingLocations(locationIds, locationData);
    }
  } else {
    res.status(400);
    return res.send({
      success: 0,
      message: 'Invalid Postcode',
      searchmethod: 'postcode',
    });
  }

  return sendLocationsResponse(res, locationData, 'postcode');
};

// // GET Location API by postalCode
router.route('/:postcode').get(async function (req, res) {
  await getLocationsByPostcode(req, res, false, req.params.postcode);
});

router.get('/matching/:postcode', Authorization.isAuthorised);
// // GET Location API by postalCode
router.route('/matching/:postcode').get(async function (req, res) {
  await getLocationsByPostcode(req, res, true, req.params.postcode);
});

module.exports = router;
module.exports.getLocationsByPostcode = getLocationsByPostcode;
