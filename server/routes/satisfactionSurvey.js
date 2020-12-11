const express = require('express');
const router = express.Router();
const models = require('../models');

const submitSurvey = async function (survey) {
  const user = await models.user.findByUUID(survey.userId);

  if (user) {
    await models.satisfactionSurvey.create({
      userFk: user.id,
      didYouDoEverything: survey.didYouDoEverything,
      didYouDoEverythingAdditionalAnswer: survey.didYouDoEverythingAdditionalAnswer,
      howDidYouFeel: survey.howDidYouFeel,
    });
  }
};

router.route('/').post(async function (req, res) {
  try {
    await submitSurvey(req.body);

    return res.status(201).send();
  } catch (err) {
    return res.status(500).send();
  }
});

module.exports = router;
