const express = require('express');
const router = express.Router();
const models = require('../models');

const longTermAbsence = (req, res) => {
  try {
    const reasons = models.worker.rawAttributes.LongTermAbsence.values;
    res.status(200);
    return res.json({
      reasons,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/').get(longTermAbsence);
module.exports = router;
module.exports.longTermAbsence = longTermAbsence;
