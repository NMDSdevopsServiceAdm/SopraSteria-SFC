const express = require('express');
const models = require('../models');

const router = express.Router();

const getAllTravelTimePayOptions = async (_req, res) => {
  try {
    const travelTimePayOptions = await models.travelTimePayOption.findAll({
      raw: true,
    });
    return res.status(200).send({ travelTimePayOptions });
  } catch (err) {
    console.error('GET /travelTimePayOption - failed', err);

    return res.status(500).send();
  }
};

router.route('/');
router.route('/').get(getAllTravelTimePayOptions);

module.exports = { travelTimePayOptionsRouter: router, getAllTravelTimePayOptions };
