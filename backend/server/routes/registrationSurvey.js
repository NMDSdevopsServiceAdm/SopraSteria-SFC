const express = require('express');
const router = express.Router();
const models = require('../models');
const Authorization = require('../utils/security/isAuthenticated');
const { celebrate, Joi, errors } = require('celebrate');

const submitSurvey = async (req, res) => {
  const user = await models.user.findByUUID(req.user.id);

  try {
    await models.registrationSurvey.create({
      userFk: user.id,
      whyDidYouCreateAccount: req.body.whyDidYouCreateAccount,
      howDidYouHearAboutASCWDS: req.body.howDidYouHearAboutASCWDS,
    });

    res.status(200).send();
  } catch (error) {
    res.status(500).send();
    console.error(error);
  }
};

router.route('/').post(
  celebrate({
    body: Joi.object().keys({
      whyDidYouCreateAccount: Joi.array().items(Joi.string()),
      howDidYouHearAboutASCWDS: Joi.array().items(Joi.string()),
    }),
  }),
  Authorization.isAuthorised,
  submitSurvey,
);

router.use('/', errors());

module.exports = router;
module.exports.submitSurvey = submitSurvey;
