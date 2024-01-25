const express = require('express');
const router = express.Router({ mergeParams: true });

router.use('/getAllTrainingAndQualifications', require('./getAllTrainingAndQualifications'));

module.exports = router;
