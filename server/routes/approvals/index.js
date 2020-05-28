// default route for admin
const express = require('express');
const router = express.Router();

const becomeAParent = require('./becomeAParent');

router.use('/become-a-parent', becomeAParent);

module.exports = router;
