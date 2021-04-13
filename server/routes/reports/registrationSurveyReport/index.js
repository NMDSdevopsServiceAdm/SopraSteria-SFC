const express = require('express');
const router = express.Router();

router.use('/new', require('./report'));

router.route('/').get(async (_req, res) => {
  return res.status(501).send();
});

module.exports = router;
