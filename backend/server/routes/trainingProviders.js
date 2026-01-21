const express = require('express');
const models = require('../models');

const router = express.Router();

const getAllTrainingProviders = async (_req, res) => {
  try {
    const trainingProviders = await models.trainingProvider.findAll({
      attributes: ['id', 'name', 'isOther'],
      order: [['id', 'ASC']],
      raw: true,
    });
    return res.status(200).send({ trainingProviders });
  } catch (err) {
    console.error('GET /trainingProviders - failed', err);

    return res.status(500).send();
  }
};

router.route('/');
router.route('/').get(getAllTrainingProviders);

module.exports = { trainingProvidersRouter: router, getAllTrainingProviders };
