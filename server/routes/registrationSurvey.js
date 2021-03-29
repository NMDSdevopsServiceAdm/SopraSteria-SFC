const express = require('express');
const router = express.Router();
const models = require('../models');

const submitSurvey = async (req, res) => {
  //If the survey is a success we need to update the user record so they aren't given the survey again
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
