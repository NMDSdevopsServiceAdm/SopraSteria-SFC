var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL nationalities*/
router.route('/').get(async function (req, res) {
  try {
    let results = await models.nationality.findAll({
      order: [['seq', 'ASC']],
    });

    res.send({
      nationalities: nationalityJSON(results),
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

function nationalityJSON(givenNationalities) {
  let nationalities = [];

  givenNationalities.forEach((thisNationality) => {
    nationalities.push({
      id: thisNationality.id,
      nationality: thisNationality.nationality,
    });
  });

  return nationalities;
}

module.exports = router;
