const express = require('express');
const router = express.Router();
const models = require('../models');

const submitSurvey = async (req, res) => {
  try {
    await models.registrationSurvey.create({
      userFk: req.user.id,
      participation: req.body.participation,
      whyDidYouCreateAccount: req.body.whyDidYouCreateAccount,
      howDidYouHearAboutASCWDS: req.body.howDidYouHearAboutASCWDS,
    });
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
};

router.route('/').post(submitSurvey);
module.exports.submitSurvey = submitSurvey;
