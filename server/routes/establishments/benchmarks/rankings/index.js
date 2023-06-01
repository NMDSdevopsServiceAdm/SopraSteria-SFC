const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../../models');
const { calculateRankDesc, calculateRankAsc } = require('../../../../utils/benchmarksUtils');
const {
  getPay,
  getQualifications,
  getSickness,
  getTurnover,
  getComparisonGroupRankings,
} = require('../benchmarksService');

const getPayRanking = async function (establishmentId) {
  return await getComparisonGroupAndCalculateRanking(
    establishmentId,
    models.benchmarksPay,
    getPay,
    (r) => r.pay,
    calculateRankDesc,
  );
};

const getQualificationsRanking = async function (establishmentId) {
  return await getComparisonGroupAndCalculateRanking(
    establishmentId,
    models.benchmarksQualifications,
    getQualifications,
    (r) => parseFloat(r.qualifications),
    calculateRankDesc,
  );
};

const getSicknessRanking = async function (establishmentId) {
  return await getComparisonGroupAndCalculateRanking(
    establishmentId,
    models.benchmarksSickness,
    getSickness,
    (r) => parseInt(r.sickness),
    calculateRankAsc,
  );
};

const getTurnoverRanking = async function (establishmentId) {
  return await getComparisonGroupAndCalculateRanking(
    establishmentId,
    models.benchmarksTurnover,
    getTurnover,
    (r) => parseFloat(r.turnover),
    calculateRankAsc,
  );
};

const getComparisonGroupAndCalculateRanking = async function (
  establishmentId,
  benchmarksModel,
  getMetricCallback,
  mapComparisonGroupCallback,
  calculateRankingCallback,
) {
  const comparisonGroupRankings = await getComparisonGroupRankings(establishmentId, benchmarksModel);

  if (comparisonGroupRankings.length === 0) {
    return {
      hasValue: false,
      stateMessage: 'no-comparison-data',
    };
  }
  const maxRank = comparisonGroupRankings.length + 1;
  const metric = await getMetricCallback(establishmentId);
  if (metric.stateMessage) {
    return {
      maxRank,
      hasValue: false,
      ...metric,
    };
  }

  const rankings = comparisonGroupRankings.map(mapComparisonGroupCallback);
  const currentRank = await calculateRankingCallback(metric.value, rankings);

  return {
    maxRank,
    currentRank,
    hasValue: true,
  };
};

const getResponse = async function (req, res, getRankingCallback) {
  try {
    const establishmentId = req.establishmentId;

    const responseData = await getRankingCallback(establishmentId);
    console.log({ responseData });
    res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getPayResponse = async (req, res) => {
  await getResponse(req, res, getPayRanking);
};

const getQualificationsResponse = async (req, res) => {
  await getResponse(req, res, getQualificationsRanking);
};

const getSicknessResponse = async (req, res) => {
  await getResponse(req, res, getSicknessRanking);
};

const getTurnoverResponse = async (req, res) => {
  await getResponse(req, res, getTurnoverRanking);
};

const getRankingsResponse = async (req, res) => {
  const establishmentId = req.establishmentId;

  const pay = await getPayRanking(establishmentId);
  const turnover = await getTurnoverRanking(establishmentId);
  const sickness = await getSicknessRanking(establishmentId);
  const qualifications = await getQualificationsRanking(establishmentId);

  const data = {
    pay,
    turnover,
    sickness,
    qualifications,
  };

  res.status(200).json(data);
};

router.route('/').get(getRankingsResponse);

router.route('/pay').get(getPayResponse);
router.route('/qualifications').get(getQualificationsResponse);
router.route('/sickness').get(getSicknessResponse);
router.route('/turnover').get(getTurnoverResponse);

module.exports = router;
module.exports.pay = getPayRanking;
module.exports.qualifications = getQualificationsRanking;
module.exports.sickness = getSicknessRanking;
module.exports.turnover = getTurnoverRanking;
