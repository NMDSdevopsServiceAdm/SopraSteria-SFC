const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../models');

const slack = require('../utils/slack/slack-logger');
const sns = require('../aws/sns');

router.route('/').post(async (req, res) => {
  try {
    if (!(req.body.doingWhat || req.body.tellUs)) {
      console.error('Unexpected input; expected either or both of "doing what" or "tell us"; got neither');
      return res
        .status(400)
        .send('Unexpected input; expected either or both of "doing what" or "tell us"; got neither');
    }

    const feedbackMsg = {
      doingWhat: req.body.doingWhat ? req.body.doingWhat : '',
      tellUs: req.body.tellUs ? req.body.tellUs : '',
    };
    const results = await models.feedback.create(feedbackMsg);

    slack.info('Feedback', JSON.stringify(feedbackMsg, null, 2));
    sns.postToFeedback(feedbackMsg);

    if (results) {
      return res.status(201).send();
    } else {
      return res.status(500).send('Unable to post feedback');
    }
  } catch (err) {
    console.error('jobs GET - failed', err);
    return res.status(500).send('Unable to post feedback');
  }
});

module.exports = router;
