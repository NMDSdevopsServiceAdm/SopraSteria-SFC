// registration of all sub routes
const express = require('express');
const router = express.Router();

const Authorization = require('../../utils/security/isLocalTest');

const Postcode = require('./postcode');
const Location = require('./location');
const Truncate = require('./cleanStart');
const Timestamp = require('./timestamp');

// ensure all test only routes are authorised - restricted by local test environments (localhost and dev only)
router.use('/', Authorization.isAuthorised);
router.use('/postcodes', Postcode);
router.use('/locations', Location);
router.use('/clean', Truncate);
router.use('/timestamp', Timestamp);

module.exports = router;
