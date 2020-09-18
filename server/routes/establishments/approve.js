const express = require('express');
const router = express.Router({ mergeParams: true });

router.route('/').post(async (req, res) => {
  // placeholder
  return res.status(200).send({});
});

module.exports = router;
