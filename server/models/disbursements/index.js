const express = require('express');
const router = express.Router({ mergeParams: true });

router.use('/', require('./getQualifications'));

module.exports = router;
