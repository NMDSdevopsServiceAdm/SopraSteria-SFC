var express = require('express');
var router = express.Router();
const pCodeCheck = require('../utils/postcodeSanitizer');
const Authorization = require('../utils/security/isAuthenticated');
const models = require('../models/index');

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

const getLocationsByPostcode = async (req, res, matching, postcode) => {
  let locationData = [];

  let locationIds = [];
  //Clean user submitted postcode
  let cleanPostcode = pCodeCheck.sanitisePostcode(postcode);

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
          currentEstablishments.map((establishment) => {
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
      searchmethod: 'postcode',
    });
  }

  if (locationData.length === 0) {
    res.status(404);
    return res.send({
      success: 0,
      message: 'No location found',
      searchmethod: 'postcode',
    });
  } else {
    res.status(200);
    return res.json({
      success: 1,
      message: 'Location(s) Found',
      locationdata: locationData,
      searchmethod: 'postcode',
    });
  }
};

const getLocationsByPostcodeOrLocationID = async (req, res, matching) => {
  // this sinitises the postcode but also checks it's a postcode
  let postcodeOrLocationID = pCodeCheck.sanitisePostcode(req.params.postcodeOrLocationID);

  if (postcodeOrLocationID !== null) {
    return await module.exports.getLocationsByPostcode(req, res, matching, postcodeOrLocationID);
  } else {
    return await module.exports.getLocations(req, res, matching, req.params.postcodeOrLocationID);
  }
};

// GET Location API by locationId
router.route('/lid/:locationId').get(async function (req, res) {
  const locationID = req.params.locationId;
  await getLocations(req, res, false, locationID);
});

router.get('/lid/matching/:locationId', Authorization.isAuthorised);
// GET Location API by locationId
router.route('/lid/matching/:locationId').get(async function (req, res) {
  const locationID = req.params.locationId;
  await getLocations(req, res, true, locationID);
});

// // GET Location API by postalCode
router.route('/pc/:postcode').get(async function (req, res) {
  const postcode = req.params.postcode;
  await getLocationsByPostcode(req, res, false, postcode);
});

router.get('/pc/matching/:postcode', Authorization.isAuthorised);
// // GET Location API by postalCode
router.route('/pc/matching/:postcode').get(async function (req, res) {
  const postcode = req.params.postcode;
  await getLocationsByPostcode(req, res, true, postcode);
});

// // GET Location API by postalCode
router.route('/pcorlid/:postcodeOrLocationID').get(async function (req, res) {
  await getLocationsByPostcodeOrLocationID(req, res, false);
});

router.get('/pcorlid/matching/:postcodeOrLocationID', Authorization.isAuthorised);
// // GET Location API by postalCode
router.route('/pcorlid/matching/:postcodeOrLocationID').get(async function (req, res) {
  await getLocationsByPostcodeOrLocationID(req, res, true);
});

function createLocationDetailsObject(data) {
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
}

module.exports = router;
module.exports.getLocations = getLocations;
module.exports.getLocationsByPostcode = getLocationsByPostcode;
module.exports.getLocationsByPostcodeOrLocationID = getLocationsByPostcodeOrLocationID;
