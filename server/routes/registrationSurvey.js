const express = require('express');
const router = express.Router();
const models = require('../models');

const submitSurvey = async (req, res) => {
  try {
    const user = await models.user.findByUUID(req.body.userUUID);

    await models.registrationSurvey.create({
      userFk: user.id,
      surveyAnswers: req.body.surveyAnswers,
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
};

router.route('/').post(submitSurvey);
module.exports.submitSurvey = submitSurvey;
