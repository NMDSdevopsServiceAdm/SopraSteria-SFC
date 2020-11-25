// default route for Local Authority routes
const express = require('express');
const router = express.Router();

const report = require('./report');

router.route('/new').get(report.generateDeleteReport);

router.route('/').get(async (req, res) => {
  return res.status(501).send();
});

module.exports = router;
