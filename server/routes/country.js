var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL countries*/
router.route('/').get(async function (req, res) {
    let results = await models.country.findAll({
        order: [
          ["seq", "ASC"]
        ]
      });

    res.send({
      countries: countryJSON(results)
    });
});

function countryJSON(givenCountries){
  let countries=[];

  givenCountries.forEach(thisCountry => {
    countries.push({
      id: thisCountry.id,
      country: thisCountry.country
    });
  });

  return countries;
};

module.exports = router;
