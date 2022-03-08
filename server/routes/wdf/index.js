// default route for wdf
const express = require('express');
const router = express.Router();

const DisbursementFile = require('./disbursementFile');

router.use('/disbursementFile', DisbursementFile);

module.exports = router;
