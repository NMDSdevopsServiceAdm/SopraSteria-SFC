const express = require('express');
const models = require('../models');

const router = express.Router();

const getAllNurseFieldsOfPractice = async (_req, res) => {
  try {
    const allChoices = await models.nurseFieldOfPractice.findAll({
      raw: true,
    });
    return res.status(200).send({ allNurseFieldsOfPractice: allChoices });
  } catch (err) {
    console.error('GET /nurseFieldOfPractice - failed', err);

    return res.status(500).send();
  }
};

router.route('/');
router.route('/').get(getAllNurseFieldsOfPractice);

module.exports = { nurseFieldOfPracticeRouter: router, getAllNurseFieldsOfPractice };
