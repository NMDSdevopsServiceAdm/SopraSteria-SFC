var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL  qualifications*/
router.route('/').get(async function (req, res) {
  try {
    let results = await models.workerLeaveReasons.findAll({
      order: [['seq', 'ASC']],
    });

    res.send({
      reasons: reasonsJSON(results),
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

function reasonsJSON(givenReasons) {
  let reasons = [];

  givenReasons.forEach((thisReason) => {
    reasons.push({
      id: thisReason.id,
      reason: thisReason.reason,
    });
  });

  return reasons;
}

module.exports = router;
