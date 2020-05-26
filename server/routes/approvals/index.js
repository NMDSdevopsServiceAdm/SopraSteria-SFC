// default route for admin
const express = require('express');
const router = express.Router();

const becomeAparent = require('./becomeAParent');

router.use('/become-a-parent', becomeAparent);

module.exports = router;
