const express = require('express');
const router = express.Router({ mergeParams: true });

router.use('/', require('./generateTrainingAndQualificationsReport'));

module.exports = router;
