const express = require('express');
const router = express.Router();

router.use('/inactive-workplaces', require('./inactive-workplaces'));

module.exports = router;
