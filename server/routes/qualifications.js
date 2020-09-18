var express = require('express');
var router = express.Router();
const models = require('../models/index');

/* GET ALL  qualifications*/
router.route('/').get(async function (req, res) {
  try {
    let results = await models.qualification.findAll({
      order: [['seq', 'ASC']],
    });

    res.send({
      qualifications: qualificationJSON(results),
    });
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

function qualificationJSON(givenQualifications) {
  let qualifications = [];

  givenQualifications.forEach((thisQualification) => {
    qualifications.push({
      id: thisQualification.id,
      level: thisQualification.level,
    });
  });

  return qualifications;
}

module.exports = router;
