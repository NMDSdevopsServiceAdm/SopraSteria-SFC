const express = require('express');
const router = express.Router();
const Authorization = require('../../../utils/security/isAuthenticated');
const models = require('../../../models/index');
const pCodeCheck = require('../../../utils/postcodeSanitizer');
const { createLocationDetailsObject } = require('../createLocationDetailsObject');

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

// // GET Location API by postalCode
router.route('/:postcode').get(async function (req, res) {
  const postcode = req.params.postcode;
  await getLocationsByPostcode(req, res, false, postcode);
});

router.get('/matching/:postcode', Authorization.isAuthorised);
// // GET Location API by postalCode
router.route('/matching/:postcode').get(async function (req, res) {
  const postcode = req.params.postcode;
  await getLocationsByPostcode(req, res, true, postcode);
});

module.exports = router;
module.exports.getLocationsByPostcode = getLocationsByPostcode;
