const express = require('express');
const router = express.Router({ mergeParams: true });

router.use('/getAllTrainingAndQualifications', require('./getAllTrainingAndQualifications'));
router.use('/hasAnyTrainingOrQualifications', require('./hasAnyTrainingOrQualifications'));

module.exports = router;
