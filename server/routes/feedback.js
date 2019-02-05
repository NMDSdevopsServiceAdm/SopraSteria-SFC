const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../models');

// note - intentionally no get for feedback

// submit feedback
router.route('/').post(async (req, res) => {

  try {
    // expecting doingWhat and tellUs attributes, even though they could be of zero length
    //  TODO: check with the BA regarding the both mandatory logic; either/or, but at least one makes more sense.
    // intentionally leaving out any specific validation - awaiting JSON schema validation.

    // express JSON body parser undefines attribute if it is an empty string!
    const doingWhat =  req.body.doingWhat ? req.body.doingWhat : '';
    const tellUs =  req.body.tellUs ? req.body.tellUs : '';

    if (!(req.body.doingWhat || req.body.tellUs)) {
      console.error('Unexpected input; expected either or both of "doing what" or "tell us"; got neither');
      return res.status(400).send('Unexpected input; expected either or both of "doing what" or "tell us"; got neither');
    }

    let results = await models.feedback.create({
      doingWhat,
      tellUs,
      name: req.body.name,
      email: req.body.email
    });

    if (results) {
      return res.status(201).send();
    } else {
      return res.status(503).send('Unable to post feedback');
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('jobs GET - failed', err);
    return res.status(503).send('Unable to post feedback');
  }
});

module.exports = router;
