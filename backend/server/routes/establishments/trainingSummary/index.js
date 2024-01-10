const express = require('express');
const router = express.Router({ mergeParams: true });

router.use('/', require('./getAllWorkersTrainingByStatus'));

module.exports = router;
