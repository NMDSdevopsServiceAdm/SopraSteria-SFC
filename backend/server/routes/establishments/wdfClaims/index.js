'use strict';

const { hasPermission } = require('../../../utils/security/hasPermission');

const router = require('express').Router();

router.use('/', hasPermission('canManageWdfClaims'));

router.use('/grantLetter', require('./grantLetter.js'));

module.exports = router;
