const express = require('express');
const router = express.Router({ mergeParams: true });

router.use('/:status', require('./getAllWorkersTrainingByStatus'));

module.exports = router;
