const express = require('express');
const router = express.Router({ mergeParams: true });
// const getLastUpdatedTAndQs = require('./');

// router.get('/lastUpdated', getLastUpdatedTAndQs);
router.use('/getAllTrainingAndQualifications', require('./getAllTrainingAndQualifications'));

module.exports = router;
