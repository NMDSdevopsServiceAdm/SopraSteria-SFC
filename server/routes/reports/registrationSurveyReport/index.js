const express = require('express');
const router = express.Router();

router.route('/').get(async (_req, res) => {
  return res.status(501).send();
});
router.use('/report', require('./report'));

module.exports = router;
