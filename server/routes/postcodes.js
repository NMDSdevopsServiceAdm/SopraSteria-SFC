var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET all locations and POST new locations */
// CRUD Location API by postalCode
router.route('/:postcode')

  .get(async function (req, res) {

    //console.log(res);


    // models.testpostcode.create({
    //   postalcode: 'SUCC ESS'
    // });
    let postcodeData =[];

    let results = await models.pcodedata.findAll({
      where: {
        postcode: req.params.postcode
      }
    });

    for (let i=0, len=results.length; i<len; i++){

      let data=results[i].dataValues;

      let myObject = {
        locationName: data.rm_organisation_name,
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
