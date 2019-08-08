// default route for admin/search
const express = require('express');
const router = express.Router();

const establishments = require('./establishments');
const users = require('./users');

router.use('/establishments', establishments);
router.use('/users', users);

module.exports = router;
