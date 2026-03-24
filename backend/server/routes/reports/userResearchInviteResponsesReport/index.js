const express = require('express');
const router = express.Router();

const report = require('./report');

router.route('/').get(report.generateUserResearchInviteResponsesReport);

module.exports = router;
