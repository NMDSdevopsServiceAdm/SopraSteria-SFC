const express = require('express');
const router = express.Router();
const Authorization = require('../../../utils/security/isAuthenticated');
const models = require('../../../models/index');
const { createLocationDetailsObject } = require('../createLocationDetailsObject');

const getLocations = async (req, res, matching, locationID) => {
  let locationData = [];

  //Find matching location data
  let result = await models.location.findOne({
    where: {
      locationid: locationID,
    },
  });

  if (result != null) {
    let data = result.dataValues;
    locationData.push(createLocationDetailsObject(data));
  }

  // If the user is an Admin and the Location was not found, we want them to be able to use the location ID that they searched for.
  if (locationData.length === 0 && req.role === 'Admin') {
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

    const data = {
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

    locationData.push(createLocationDetailsObject(data));
  }

  if (matching) {
    let currentEstablishments = await models.establishment.findAll({
      where: {
        locationId: locationID,
      },
      attributes: ['locationId'],
    });
    if (currentEstablishments.length > 0) {
      locationData = [];
    }
  }

  if (locationData.length === 0) {
    res.status(404);
    return res.json({
      success: 0,
      message: 'No location found',
      searchmethod: 'locationID',
    });
  } else {
    res.status(200);
    return res.json({
      success: 1,
      message: 'Location Found',
      locationdata: locationData,
      searchmethod: 'locationID',
    });
  }
};

router.route('/:locationId');

router.route('/:locationId').get(async function (req, res) {
  const locationID = req.params.locationId;
  await getLocations(req, res, false, locationID);
});

router.get('/matching/:locationId', Authorization.isAuthorised);
// GET Location API by locationId
router.route('/matching/:locationId').get(async function (req, res) {
  const locationID = req.params.locationId;
  await getLocations(req, res, true, locationID);
});

module.exports = router;
module.exports.getLocations = getLocations;
