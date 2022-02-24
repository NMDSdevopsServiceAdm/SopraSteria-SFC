// default route for forms
const express = require('express');
const router = express.Router();

const DisbursementFile = require('./disbursementFile');

router.use('/disbursementFile', DisbursementFile);

module.exports = router;
