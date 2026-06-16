const express = require('express');
const router = express.Router({ mergeParams: true });

router.use('/parent', require('./parentReport/generateParentTrainingAndQualificationsReport'));
router.use('/', require('./generateTrainingAndQualificationsReport'));

module.exports = router;
