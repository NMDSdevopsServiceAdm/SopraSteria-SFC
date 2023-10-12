const express = require('express');
const app = express();

// caching middleware - ref and transactional
var cacheMiddleware = require('../../../server/utils/middleware/noCache');

const establishments = require('./establishments');

app.use('/api/v2/establishment', [cacheMiddleware.nocache, establishments]);

module.exports = app;
