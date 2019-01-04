var express = require('express');
var router = express.Router();
const pCodeCheck = require('../utils/postcodeSanitizer');
const models = require('../models/index');


const returnDateTime = () => {
  return (new Date()).toISOString();
};
router.route('/hello').get(async (req, res) => {
  return res.status(200).send(returnDateTime());
});
router.route('/hello').put(async (req, res) => {
  return res.status(200).send(returnDateTime());
});
router.route('/hello').delete(async (req, res) => {
  return res.status(200).send(returnDateTime());
});
router.route('/hello').post(async (req, res) => {
  return res.status(200).send(returnDateTime());
});


/* GET with Postcode parameter to find matching addresses */
router.route('/:postcode')

  .get(async function (req, res) {

    let postcodeData =[];

    //Clean user submitted postcode
    let cleanPostcode= pCodeCheck.sanitisePostcode(req.params.postcode);

    if (cleanPostcode != null) {
      //Find matching postcode data
      let results = await models.pcodedata.findAll({
        where: {
          postcode: cleanPostcode
        },
        order: [
          ['uprn', 'ASC']
        ]
      });

      //Go through any results found from DB and map to JSON
      for (let i = 0, len = results.length; i < len; i++) {

        let data = results[i].dataValues;

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
    } else {
      res.status(400);
      return res.send({
            "success" : 0,
            "message" : 'Invalid Postcode'
          });
    }

    if (postcodeData.length === 0) {
      res.status(404);
      return res.send({
        "success" : 0,
        "message" : 'No addresses found'
      });
    } else {
      res.status(200);
      return res.json({
        "success" : 1,
        "message" : "Addresses Found",
        "postcodedata": postcodeData
      });
    }
  });

module.exports = router;
