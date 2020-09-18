var express = require('express');
var router = express.Router();
const models = require('../models/index');

router.route('/').get(async function (req, res) {
  try {
    let results = await models.workerNurseSpecialism.findAll({
      order: [['seq', 'ASC']],
    });

    res.send({
      workerNurseSpecialisms: nurseSpecialismsJSON(results),
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

function nurseSpecialismsJSON(givenSpecialisms) {
  let specialisms = [];

  givenSpecialisms.forEach((thisSpecialism) => {
    specialisms.push({
      id: thisSpecialism.id,
      seq: thisSpecialism.seq,
      specialism: thisSpecialism.specialism,
    });
  });

  return specialisms;
}

module.exports = router;
