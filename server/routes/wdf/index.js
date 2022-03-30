// default route for wdf
const express = require('express');
const router = express.Router();

const DisbursementFile = require('./disbursementFile');
const DevelopmentFund = require('./developmentFundGrants');

router.use('/disbursementFile', DisbursementFile);
router.use('/developmentFund', DevelopmentFund);

module.exports = router;
