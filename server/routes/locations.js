var express = require('express');
var router = express.Router();
const pCodeCheck = require('../utils/postcodeSanitizer');
const Authorization = require('../utils/security/isAuthenticated');
const models = require('../models/index');

async function getLocations(req, res, matching) {
  let locationData = [];

  //Find matching location data
  let result = await models.location.findOne({
    where: {
      locationid: req.params.locationId,
    },
  });

  if (result != null) {
    let data = result.dataValues;
    locationData.push(createLocationDetailsObject(data));
  }

  if (matching) {
    let currentEstablishments = await models.establishment.findAll({
      where: {
        locationId: req.params.locationId,
      },
      attributes: ['locationId'],
    });
    if (currentEstablishments.length > 0) {
      locationData = [];
    }
  }

  if (locationData.length === 0) {
    res.status(404);
    return res.send({
      success: 0,
      message: 'No location found',
    });
  } else {
    res.status(200);
    return res.json({
      success: 1,
      message: 'Location Found',
      locationdata: locationData,
    });
  }
}

async function getLocationsByPostcode(req, res, matching) {
  let locationData = [];

  let locationIds = [];
  //Clean user submitted postcode
  let cleanPostcode = pCodeCheck.sanitisePostcode(req.params.postcode);

  if (cleanPostcode != null) {
    //Find matching postcode data
    let results = await models.location.findAll({
      where: {
        postalcode: cleanPostcode,
      },
    });

    for (let i = 0, len = results.length; i < len; i++) {
      let data = results[i].dataValues;
      locationData.push(createLocationDetailsObject(data));
      locationIds.push(data.locationid);
    }
    if (matching) {
      let currentEstablishments = await models.establishment.findAll({
        where: {
          locationId: {
            [models.Sequelize.Op.or]: locationIds,
          },
        },
        attributes: ['locationId'],
      });
      if (currentEstablishments.length > 0) {
        locationData.map((location, index) => {
          currentEstablishments.map(establishment => {
            if (location.locationId === establishment.locationId) {
              locationData.splice(index, 1);
            }
          });
        });
      }
    }
  } else {
    res.status(400);
    return res.send({
      success: 0,
      message: 'Invalid Postcode',
    });
  }

  if (locationData.length === 0) {
    res.status(404);
    return res.send({
      success: 0,
      message: 'No location found',
    });
  } else {
    res.status(200);
    return res.json({
      success: 1,
      message: 'Location(s) Found',
      locationdata: locationData,
    });
  }
}
// GET Location API by locationId
router
  .route('/lid/:locationId')
  .get(async function(req, res) {
    await getLocations(req, res, false);
  });

router.get('/lid/matching/:locationId', Authorization.isAuthorised);
// GET Location API by locationId
router
  .route('/lid/matching/:locationId')
  .get(async function(req, res) {
    await getLocations(req, res, true);
  });

// // GET Location API by postalCode
router.route('/pc/:postcode').get(async function(req, res) {
  await getLocationsByPostcode(req, res, false);
});

router.get('/pc/matching/:postcode', Authorization.isAuthorised);
// // GET Location API by postalCode
router.route('/pc/matching/:postcode').get(async function(req, res) {
  await getLocationsByPostcode(req, res, true);
});

function createLocationDetailsObject(data) {
  //Map DB fields to expected JSON output
  let myObject = {
    locationId: data.locationid,
    locationName: data.locationname,
    addressLine1: data.addressline1,
    addressLine2: data.addressline2,
    townCity: data.towncity,
    county: data.county,
    postalCode: data.postalcode,
    mainService: data.mainservice,
    isRegulated: data.isRegulated
  };

  return myObject;
}

module.exports = router;
