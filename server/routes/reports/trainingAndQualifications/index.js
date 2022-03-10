const express = require('express');
const router = express.Router({ mergeParams: true });

router.use('/', require('./generateTrainingAndQualificationsReport'));
router.use('/parent', require('./parentReport/generateParentTrainingAndQualificationsReport'));

module.exports = router;
