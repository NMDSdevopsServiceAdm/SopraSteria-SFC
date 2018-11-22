var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET with Postcode parameter to find matching addresses */
router.route('/:postcode')

  .get(async function (req, res) {

    let postcodeData =[];

    //Find matching postcode data
    let results = await models.pcodedata.findAll({
      where: {
        postcode: req.params.postcode
      }
    });

    //Go through any results found from DB and map to JSON
    for (let i=0, len=results.length; i<len; i++){

      let data=results[i].dataValues;

      let myObject = {
        locationName: data.rm_organisation_name,
        //Use Building Name if it exists, otherwise use building number
        addressLine1: (data.building_name !== "") ? data.building_name : data.building_number,
        addressLine2: data.street_description,
        townCity: data.post_town,
        county: data.county,
        postalCode: data.postcode
      };

      postcodeData.push(myObject);
    }

    if (postcodeData.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(postcodeData);
    }
  });

module.exports = router;
