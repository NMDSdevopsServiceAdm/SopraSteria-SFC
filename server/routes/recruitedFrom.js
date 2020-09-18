var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL recruited from */
router.route('/').get(async function (req, res) {
  try {
    let results = await models.recruitedFrom.findAll({
      order: [['seq', 'ASC']],
    });

    res.send({
      recruitedFrom: recruitedFromJSON(results),
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

function recruitedFromJSON(givenFrom) {
  let recruitedFrom = [];

  givenFrom.forEach((thisFrom) => {
    recruitedFrom.push({
      id: thisFrom.id,
      from: thisFrom.from,
    });
  });

  return recruitedFrom;
}

module.exports = router;
