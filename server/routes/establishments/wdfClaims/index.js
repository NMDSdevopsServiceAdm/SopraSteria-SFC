'use strict';

const { hasPermission } = require('../../../utils/security/hasPermission');

const router = require('express').Router();

router.use('/', hasPermission(''));

router.use('/grantLetter', require('./grantLetter.js'));

module.exports = router;
