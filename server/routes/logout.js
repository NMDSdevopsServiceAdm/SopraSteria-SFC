const express = require('express');
const models = require('../models/index');
const router = express.Router();
const moment = require('moment');
const Authorization = require('../utils/security/isAuthenticated');
const config = require('../config/config');
const Sentry = require('@sentry/node');

const logout = async function (username) {
  Sentry.configureScope((scope) => scope.setUser(null));
  const { registrationId } = await models.login.findByUsername(username);

  const auditEvent = {
    userFk: registrationId,
    username: username,
    type: 'logout',
  };
  await models.userAudit.create(auditEvent);

  const fromDate = moment()
    .subtract(config.get('satisfactionSurvey.timeSpan'), config.get('satisfactionSurvey.unit'))
    .toDate();

  const logouts = await models.userAudit.countLogouts(registrationId, fromDate);
  const submissions = await models.satisfactionSurvey.countSubmissions(registrationId, fromDate);

  const showSurvey = logouts <= 3 && submissions == 0;

  return { showSurvey };
};

router.use('/', Authorization.isAuthorised);
router.post('/', async (req, res) => {
  try {
    const username = req.username;

    const response = await logout(username);

    res.status(200).json(response);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
module.exports.logout = logout;
