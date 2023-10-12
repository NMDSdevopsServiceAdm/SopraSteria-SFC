const express = require('express');
const router = express.Router();

const Benchmarks = require('./benchmarks');

router.use('/:id/benchmarks', Benchmarks);

module.exports = router;
