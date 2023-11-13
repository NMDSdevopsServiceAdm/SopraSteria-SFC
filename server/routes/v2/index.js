const express = require('express');
const router = express.Router();
// caching middleware - ref and transactional
var cacheMiddleware = require('../../../server/utils/middleware/noCache');

const establishments = require('./establishments');

router.use('/establishment', [cacheMiddleware.nocache, establishments]);

module.exports = router;
