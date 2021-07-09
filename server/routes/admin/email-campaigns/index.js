const express = require('express');
const router = express.Router();

router.use('/inactive-workplaces', require('./inactive-workplaces'));
router.use('/targeted-emails', require('./targeted-emails'));

module.exports = router;
