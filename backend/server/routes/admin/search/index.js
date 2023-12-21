// default route for admin/search
const express = require('express');
const router = express.Router();

const { fileExports } = require('./establishments');
const users = require('./users');
const groups = require('./groups');

router.use('/establishments', fileExports.search);
router.use('/users', users);
router.use('/groups', groups);

module.exports = router;
