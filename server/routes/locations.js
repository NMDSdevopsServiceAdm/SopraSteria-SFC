var express = require('express');
var router = express.Router();
const pCodeCheck = require('../utils/postcodeSanitizer');
const models = require('../models/index');


// GET Location API by locationId
router.route('/lid/:locationId')

  .get(async function (req, res) {

    let locationData = [];

    //Find matching location data
    let result = await models.location.findOne({
      where: {
        locationid: req.params.locationId
      }
    });

    let data = result.dataValues;
    locationData.push(createLocationDetailsObject(data));

    if (locationData.length === 0) {
      res.status(404);
      return res.send({
        "success": 0,
        "message": 'No location found'
      })
    } else {
      res.status(200);
      return res.json({
        "success" : 1,
        "message" : "Location Found",
        "locationdata": locationData
      });
    }
  })


// // GET Location API by postalCode
router.route('/pc/:postcode')
  .get(async function (req, res) {

    let locationData = [];

    //Clean user submitted postcode
    let cleanPostcode= pCodeCheck.sanitisePostcode(req.params.postcode);

    if (cleanPostcode != null) {
      //Find matching postcode data
      let results = await models.location.findAll({
        where: {
          postalcode: cleanPostcode
        }
      });

      for (let i = 0, len = results.length; i < len; i++) {

        let data = results[i].dataValues;
        locationData.push(createLocationDetailsObject(data));

      }
    } else {
      res.status(400);
      return res.send({
        "success" : 0,
        "message" : 'Invalid Postcode'
      });
    }

    if (locationData.length === 0) {
      res.status(404);
      return res.send({
        "success" : 0,
        "message" : 'No location found'
      });
    } else {
      res.status(200);
      return res.json({
        "success" : 1,
        "message" : "Location(s) Found",
        "locationdata": locationData
      });
    }
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
    mainService: data.mainservice
  };

  return myObject;
}

module.exports = router;
