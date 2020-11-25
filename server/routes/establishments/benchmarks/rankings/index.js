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

router.route('/pay').get(async (req, res) => {
  await getResponse(req, res, getPayRanking);
});

router.route('/qualifications').get(async (req, res) => {
  await getResponse(req, res, getQualificationsRanking);
});

router.route('/sickness').get(async (req, res) => {
  await getResponse(req, res, getSicknessRanking);
});

router.route('/turnover').get(async (req, res) => {
  await getResponse(req, res, getTurnoverRanking);
});

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const promises = [
    { metric: 'pay', f: getPayRanking },
    { metric: 'qualifications', f: getQualificationsRanking },
    { metric: 'sickness', f: getSicknessRanking },
    { metric: 'turnover', f: getTurnoverRanking },
  ]

  const responseData = await Promise.all(promises.map(async promise => {
    const data = await promise.f(establishmentId);
    return { metric: promise.metric, data }
  }));

  res.status(200).json(responseData.reduce((obj, item) => {
    obj[item.metric] = item.data;
    return obj;
  }, {}));
});

const getResponse = async function (req, res, getRankingCallback) {
  const establishmentId = req.establishmentId;

  const responseData = await getRankingCallback(establishmentId);

  res.status(200).json(responseData);
};

module.exports = router;
module.exports.pay = getPayRanking;
module.exports.qualifications = getQualificationsRanking;
module.exports.sickness = getSicknessRanking;
module.exports.turnover = getTurnoverRanking;
