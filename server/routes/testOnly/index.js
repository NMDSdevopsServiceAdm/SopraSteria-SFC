// registration of all sub routes
const express = require('express');
const router = express.Router();

const Authorization = require('../../utils/security/isLocalhost');

const Postcode = require('./postcode');
const Location = require('./location');
const Truncate = require('./cleanStart');

// ensure all test only routes are authorised - restricted by localhost
router.use('/', Authorization.isAuthorised);
router.use('/postcodes', Postcode);
router.use('/locations', Location);
router.use('/clean', Truncate);

module.exports = router;