// default route and registration of all sub routes
const express = require('express');
const router = express.Router();
const Authorization = require('../../../utils/security/isAuthenticated');

const Benchmarks = require('./benchmarks');

// ensure all establishment routes are authorised
router.use('/:id', Authorization.hasAuthorisedEstablishment);
router.use('/:id/benchmarks', Benchmarks);

module.exports = router;
