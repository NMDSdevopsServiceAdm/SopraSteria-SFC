'use strict';
const router = require('express').Router();

router.use('/dates', require('./dates'));
router.use('/monitor', require('./monitor'));

module.exports = router;
