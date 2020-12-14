const express = require('express');
const router = express.Router();
const models = require('../models');

const submitSurvey = async function (survey) {
  const user = await models.user.findByUUID(survey.userId);
  const establishment = await models.establishment.findByUid(survey.establishmentId);

  if (user && establishment) {
    await models.satisfactionSurvey.create({
      userFk: user.id,
      establishmentFk: establishment.id,
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
