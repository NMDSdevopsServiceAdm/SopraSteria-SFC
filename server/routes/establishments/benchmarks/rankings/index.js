const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../../models');
const calculateRank = require('../../../../utils/benchmarksUtils').calculateRank;

const pay = async function(establishmentId) {
  const comparisonGroupRankings = await models.benchmarksPay.getComparisonGroupRankings(establishmentId);
  if (comparisonGroupRankings.length === 0) {
    return {
      hasValue: false,
      stateMessage: 'no-comparison-data'
    }
  }
  const maxRank = comparisonGroupRankings.length + 1;

  const averageHourlyPay = await models.worker.averageHourlyPay(establishmentId);
  if (averageHourlyPay.amount === null) {
    return {
      maxRank,
      hasValue: false,
      stateMessage: 'no-data'
    }
  }

  const payAsInteger = parseInt(averageHourlyPay.amount * 100);
  const payRankings = comparisonGroupRankings.map(r => r.pay);
  const currentRank = calculateRank(payAsInteger, payRankings);

  return {
    currentRank,
    maxRank,
    hasValue: true
  }
}

router.route('/pay').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const responseData = await pay(establishmentId);

  res.status(200).json(responseData);
});

module.exports = router;
module.exports.pay = pay;
