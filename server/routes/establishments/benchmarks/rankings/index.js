const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../../models');
const calculateRankDesc = require('../../../../utils/benchmarksUtils').calculateRankDesc;
const calculateRankAsc = require('../../../../utils/benchmarksUtils').calculateRankAsc;

const pay = async function (establishmentId) {
  const comparisonGroupRankings = await models.benchmarksPay.getComparisonGroupRankings(establishmentId);
  if (comparisonGroupRankings.length === 0) {
    return {
      hasValue: false,
      stateMessage: 'no-comparison-data',
    };
  }
  const maxRank = comparisonGroupRankings.length + 1;

  const averageHourlyPay = await models.worker.averageHourlyPay(establishmentId);
  if (averageHourlyPay.amount === null) {
    return {
      maxRank,
      hasValue: false,
      stateMessage: 'no-data',
    };
  }

  const payAsInteger = parseInt(averageHourlyPay.amount * 100);
  const payRankings = comparisonGroupRankings.map((r) => r.pay);
  const currentRank = calculateRankDesc(payAsInteger, payRankings);

  return {
    currentRank,
    maxRank,
    hasValue: true,
  };
};

const turnover = async function (establishmentId) {
  const comparisonGroupRankings = await models.benchmarksTurnover.getComparisonGroupRankings(establishmentId);
  if (comparisonGroupRankings.length === 0) {
    return {
      hasValue: false,
      stateMessage: 'no-comparison-data',
    };
  }

  const maxRank = comparisonGroupRankings.length + 1;

  const noWorkersOrLeavers = await workplaceHasNoWorkersOrLeaves(establishmentId, maxRank);
  if (noWorkersOrLeavers) {
    return noWorkersOrLeavers;
  }

  const permTemptCount = await models.worker.permAndTempCountForEstablishment(establishmentId);
  if (permTemptCount === 0) {
    return {
      maxRank,
      hasValue: false,
      stateMessage: 'no-perm-or-temp',
    };
  }

  const leavers = await models.establishmentJobs.leaversForEstablishment(establishmentId);
  const percentOfPermTemp = leavers / permTemptCount;
  if (percentOfPermTemp > 9.95) {
    return {
      maxRank,
      hasValue: false,
      stateMessage: 'check-data',
    };
  }

  const turnoverRankings = comparisonGroupRankings.map((r) => parseFloat(r.turnover));
  const currentRank = calculateRankAsc(percentOfPermTemp, turnoverRankings);

  return {
    maxRank,
    currentRank,
    hasValue: true,
  };
};

const workplaceHasNoWorkersOrLeaves = async function (establishmentId, maxRank) {
  const establishment = await models.establishment.turnoverData(establishmentId);
  const workerCount = await models.worker.countForEstablishment(establishmentId);
  if (!establishment || establishment.NumberOfStaffValue === 0 || workerCount !== establishment.NumberOfStaffValue) {
    return {
      maxRank,
      hasValue: false,
      stateMessage: 'no-workers',
    };
  }

  if (establishment.LeaversValue === "Don't know" || !establishment.LeaversValue) {
    return {
      maxRank,
      hasValue: false,
      stateMessage: 'no-leavers',
    };
  }

  return false;
};

router.route('/pay').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const responseData = await pay(establishmentId);

  res.status(200).json(responseData);
});

router.route('/turnover').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const responseData = await turnover(establishmentId);

  res.status(200).json(responseData);
});

module.exports = router;
module.exports.pay = pay;
module.exports.turnover = turnover;
