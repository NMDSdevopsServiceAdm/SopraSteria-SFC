const express = require('express');
const models = require('../models/index');
const router = express.Router();
const moment = require('moment');
const Authorization = require('../utils/security/isAuthenticated');
const config = require('../config/config');

const logout = async function(username) {
  const { registrationId, user  } = await models.login.findByUsername(username);

  const auditEvent = {
    userFk: registrationId,
    username: username,
    type: 'logout',
  };
  await models.userAudit.create(auditEvent);

  const fromDate = moment().subtract(config.get('satisfactionSurvey.timeSpan'), config.get('satisfactionSurvey.unit')).toDate();

  const logouts = await models.userAudit.countLogouts(user.establishmentId, fromDate);
  const submissions = await models.satisfactionSurvey.countSubmissions(user.establishmentId, fromDate);

  const showSurvey = logouts <= 3 && submissions == 0;

  return { showSurvey };
}

router.use('/', Authorization.isAuthorised)
router.post('/', async (req, res) => {
  const username = req.username;

  const response = await logout(username);

  res.status(200).json(response);
});

module.exports = router;
module.exports.logout = logout;
