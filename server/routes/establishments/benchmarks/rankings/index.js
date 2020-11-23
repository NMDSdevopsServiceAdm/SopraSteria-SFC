const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../../models');
const calculateRankDesc = require('../../../../utils/benchmarksUtils').calculateRankDesc;
const calculateRankAsc = require('../../../../utils/benchmarksUtils').calculateRankAsc;
const { getPay, getQualifications, getTurnover } = require('../benchmarksService');

const getPayRanking = async function (establishmentId) {
  async function payRankingLogic(establishmentId, maxRank, comparisonGroupRankings) {
    const pay = await getPay(establishmentId);
    if (pay.stateMessage) {
      return {
        maxRank,
        hasValue: false,
        ...pay,
      };
    }

    const payRankings = comparisonGroupRankings.map((r) => r.pay);
    const currentRank = calculateRankDesc(pay.value, payRankings);

    return {
      currentRank,
      maxRank,
      hasValue: true,
    };
  }

  return await getComparisonGroupAndRanking(establishmentId, models.benchmarksPay, payRankingLogic);
};

const getQualificationsRanking = async function (establishmentId) {
  async function qualificationsRankingLogic(establishmentId, maxRank, comparisonGroupRankings) {
    const qualifications = await getQualifications(establishmentId);
    if (qualifications.stateMessage) {
      return {
        maxRank,
        hasValue: false,
        ...qualifications,
      };
    }

    const qualificationsRankings = comparisonGroupRankings.map((r) => parseFloat(r.qualifications));
    const currentRank = calculateRankDesc(qualifications.value, qualificationsRankings);

    return {
      maxRank,
      currentRank,
      hasValue: true,
    };
  }

  return await getComparisonGroupAndRanking(
    establishmentId,
    models.benchmarksQualifications,
    qualificationsRankingLogic,
  );
};

const getTurnoverRanking = async function (establishmentId) {
  async function turnoverRankingLogic(establishmentId, maxRank, comparisonGroupRankings) {
    const turnover = await getTurnover(establishmentId);
    if (turnover.stateMessage) {
      return {
        maxRank,
        hasValue: false,
        ...turnover,
      };
    }

    const turnoverRankings = comparisonGroupRankings.map((r) => parseFloat(r.turnover));
    const currentRank = calculateRankAsc(turnover.value, turnoverRankings);

    return {
      maxRank,
      currentRank,
      hasValue: true,
    };
  }

  return await getComparisonGroupAndRanking(establishmentId, models.benchmarksTurnover, turnoverRankingLogic);
};

const getComparisonGroupAndRanking = async function (establishmentId, benchmarksModel, getRankingCallback) {
  const comparisonGroupRankings = await benchmarksModel.getComparisonGroupRankings(establishmentId);
  if (comparisonGroupRankings.length === 0) {
    return {
      hasValue: false,
      stateMessage: 'no-comparison-data',
    };
  }
  const maxRank = comparisonGroupRankings.length + 1;

  return await getRankingCallback(establishmentId, maxRank, comparisonGroupRankings);
};

router.route('/pay').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const responseData = await getPayRanking(establishmentId);

  res.status(200).json(responseData);
});

router.route('/qualifications').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const responseData = await getQualificationsRanking(establishmentId);

  res.status(200).json(responseData);
});

router.route('/turnover').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const responseData = await getTurnoverRanking(establishmentId);

  res.status(200).json(responseData);
});

module.exports = router;
module.exports.pay = getPayRanking;
module.exports.qualifications = getQualificationsRanking;
module.exports.turnover = getTurnoverRanking;
