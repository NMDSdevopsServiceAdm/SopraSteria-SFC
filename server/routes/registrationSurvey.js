const express = require('express');
const router = express.Router();
const models = require('../models');
const Authorization = require('../utils/security/isAuthenticated');

const submitSurvey = async (req, res) => {
  const user = await models.user.findByUUID(req.user.id);
  try {
    await models.registrationSurvey.create({
      userFk: user.id,
      participation: req.body.participation,
      whyDidYouCreateAccount: req.body.whyDidYouCreateAccount,
      howDidYouHearAboutASCWDS: req.body.howDidYouHearAboutASCWDS,
    });

    res.status(200).send();
  } catch (error) {
    res.status(500).send();
    console.error();
  }
};

router.route('/').post(Authorization.isAuthorised, submitSurvey);
module.exports = router;
module.exports.submitSurvey = submitSurvey;
