const express = require('express');
const router = express.Router();
const models = require('../models');

const longTermAbsence = async (req, res) => {
  try {
    const reasons = await models.worker.rawAttributes.LongTermAbsence.values;
    res.status(200).send({
      reasons,
    });
  } catch (error) {
    console.err(error)
    return res.status(500).send();
  }
}

router.route('/').get(longTermAbsence);
module.exports = router;
