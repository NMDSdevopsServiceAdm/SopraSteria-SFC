const express = require('express');
const router = express.Router();

const report = require('./report');

router.route('/').get(report.generateUserResearchInviteResponsesReport);

router.route('/').get(async (_req, res) => {
  return res.status(501).send();
});

module.exports = router;