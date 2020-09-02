// default route for admin/search
const express = require('express');
const router = express.Router();

const establishments = require('./establishments');
const users = require('./users');
const groups = require('./groups');

router.use('/establishments', establishments);
router.use('/users', users);
router.use('/groups', groups);

module.exports = router;
