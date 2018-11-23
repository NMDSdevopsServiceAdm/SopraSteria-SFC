var express = require('express');
var router = express.Router();
const models = require('../models/index');


// GET Location API by locationId
router.route('/lid/:locationId')

  .get(async function (req, res) {

    let locationData =[];

    //Find matching location data
    let result = await models.location.findOne({
      where: {
        locationid: req.params.locationId
      }
    });

    let data=result.dataValues;
    locationData.push(createLocationDetailsObject(data));

    if (locationData.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(locationData);
    }
  })


// // GET Location API by postalCode
  router.route('/pc/:postcode')
  .get(async function (req, res) {

    let locationData =[];

    //Find matching postcode data
    let results = await models.location.findAll({
      where: {
        postalcode: req.params.postcode
      }
    });

    for (let i=0, len=results.length; i<len; i++) {

      let data = results[i].dataValues;
      locationData.push(createLocationDetailsObject(data));

    }

    if (locationData.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(locationData);
    }
  })

function createLocationDetailsObject(data){

  //Map DB fields to expected JSON output
  let myObject = {
    locationId: data.locationid,
    locationName: data.locationname,
    addressLine1: data.addressline1,
    addressLine2: data.addressline2,
    townCity: data.towncity,
    county: data.county,
    postalCode: data.postalcode,
    gacServiceTypes: [
      {name:data.mainservice}
    ]
  };

  return myObject;
}

module.exports = router;
