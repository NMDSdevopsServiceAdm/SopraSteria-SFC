var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET with Postcode parameter to find matching addresses */
router.route('/:postcode')

  .get(async function (req, res) {

    let postcodeData =[];

    //Clean user submitted postcode
    let cleanPostcode= sanitisePostcode(req.params.postcode);


    if (cleanPostcode != null) {
      //Find matching postcode data
      let results = await models.pcodedata.findAll({
        where: {
          postcode: cleanPostcode
        }
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
      console.log('Bad Postcode');
      return res.sendStatus(404);
    }

    if (postcodeData.length === 0) {
      console.log('Nothing found');
     return res.sendStatus(404);
    } else {
      return res.send(postcodeData);
    }
  });

  function sanitisePostcode(userPostcode){

    //Remove whitespaces and any non alphanumeric characters and then cast to upper case.
    let cleanedPostcode = userPostcode.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();

    //Insert space in correct position depending on postcode length.
    if (cleanedPostcode.length === 6){
      cleanedPostcode = cleanedPostcode.substr(0, 3) + ' ' + cleanedPostcode.substr(3);
    } else if (cleanedPostcode.length === 7){
      cleanedPostcode = cleanedPostcode.substr(0, 4) + ' ' + cleanedPostcode.substr(4);
    }

    //Test final string against RegEx provided by UK Gov to verify is a valid postcode. If fails, return null.
    return(/([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/.test(cleanedPostcode)) ? cleanedPostcode : null;

  }


module.exports = router;
