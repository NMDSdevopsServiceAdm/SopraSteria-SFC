const express = require('express');
const router = express.Router({ mergeParams: true });

router.use('/getAllTrainingAndQualifications', require('./getAllTrainingAndQualifications'));
router.use('/workerHasAnyTrainingOrQualifications', require('./workerHasAnyTrainingOrQualifications'));

module.exports = router;
