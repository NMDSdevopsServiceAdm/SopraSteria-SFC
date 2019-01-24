var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL nationalities*/
router.route('/').get(async function (req, res) {
    let results = await models.nationality.findAll({
        order: [
          ["seq", "ASC"]
        ]
      });

    res.send({
      nationalities: nationalityJSON(results)
    });
});

function nationalityJSON(givenNationalities){
  let nationalities=[];

  givenNationalities.forEach(thisNationality => {
    nationalities.push({
      id: thisNationality.id,
      nationality: thisNationality.nationality
    });
  });

  return nationalities;
};

module.exports = router;
