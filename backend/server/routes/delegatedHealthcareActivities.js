const express = require('express');
const models = require('../models');

const router = express.Router();

const getAllDelegatedHealthcareActivities = async (_req, res) => {
  try {
    const allDHAs = await models.delegatedHealthcareActivities.findAll({
      order: [['seq', 'ASC']],
      raw: true,
    });
    return res.status(200).send({ allDHAs });
  } catch (err) {
    console.error('GET /delegatedHealthcareActivities - failed', err);

    return res.status(500).send();
  }
};

router.route('/').get(getAllDelegatedHealthcareActivities);

module.exports = { dhaRouter: router, getAllDelegatedHealthcareActivities };
