const express = require('express');
const router = express.Router();

router.use('/lid', require('./locationID'));
router.use('/pc', require('./postcode'));
router.use('/pcorlid', require('./postcodeOrLocationID'));

module.exports = router;
