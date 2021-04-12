// default route for Local Authority routes
const express = require('express');
const router = express.Router();

const router = express.Router();
router.use('/report', require('./report'));

module.exports = router;
