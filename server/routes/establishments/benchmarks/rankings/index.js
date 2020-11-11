const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../../models');
router.route('/pay').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  console.log('Pay endpoint');
  console.log(await models.benchmarksPay.getRankings(establishmentId));
  res.status(200);
});

module.exports = router;
