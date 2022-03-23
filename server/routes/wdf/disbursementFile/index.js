const express = require('express');
const router = express.Router({ mergeParams: true });

router.use('/', require('./generateFundingClaimForm'));
router.use('/getQualifications', require('../../../models/disbursements/getQualifications'));

module.exports = router;
