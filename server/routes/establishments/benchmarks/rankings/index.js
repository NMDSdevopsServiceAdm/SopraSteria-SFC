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

const CARE_WORKER_ID = 10;
const SENIOR_CARE_WORKER_ID = 25;
const REGISTERED_NURSE_ID = 23;
const REGISTERED_MANAGER_ID = 22;

const workerMap = new Map([
  [10, 8],
  [25, 7],
  [23, 16],
  [22, 4],
]);

const getPayRanking = async function (establishmentId, mainService, workerId) {
  const annualOrHourly = [CARE_WORKER_ID, SENIOR_CARE_WORKER_ID].includes(workerId) ? 'Hourly' : 'Annually';
  const field = annualOrHourly === 'Hourly' ? 'AverageHourlyRate' : 'AverageAnnualFTE';
  const currentmetricValue = await getPay({ establishmentId, annualOrHourly, mainJob: workerId });

  const groupRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksPayByEstId',
    [field, 'MainJobRole'],
    currentmetricValue,
    (r) => r[field],
    calculateRankDesc,
    workerId,
  );

  const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksPayByEstIdGoodOutstanding',
    [field, 'MainJobRole'],
    currentmetricValue,
    (r) => r[field],
    calculateRankDesc,
    workerId,
  );

  return { groupRankings, goodCqcRankings };
};

const getQualificationsRanking = async function (establishmentId, mainService) {
  const currentmetricValue = await getQualifications({ establishmentId });

  const groupRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksQualificationsByEstId',
    ['Qualifications'],
    currentmetricValue,
    (r) => parseFloat(r.Qualifications),
    calculateRankDesc,
  );

  const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksQualificationsByEstIdGoodOutstanding',
    ['Qualifications'],
    currentmetricValue,
    (r) => parseFloat(r.Qualifications),
    calculateRankDesc,
  );

  return { groupRankings, goodCqcRankings };
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
  mainService,
  benchmarksModel,
  attributes,
  metric,
  mapComparisonGroupCallback,
  calculateRankingCallback,
  workerId,
) {
  const comparisonGroupRankings = await getComparisonGroupRankings(
    models[benchmarksModel],
    establishmentId,
    mainService,
    attributes,
    workerId && workerMap.get(workerId),
  );
  const mappedComparisonGroupRankings = comparisonGroupRankings.map(mapComparisonGroupCallback).filter((a) => a);

  if (mappedComparisonGroupRankings.length === 0) {
    return {
      hasValue: false,
      stateMessage: 'no-comparison-data',
    };
  }
  const maxRank = mappedComparisonGroupRankings.length + 1;
  if (metric.stateMessage) {
    return {
      maxRank,
      hasValue: false,
      ...metric,
    };
  }

  const currentRank = await calculateRankingCallback(metric.value, mappedComparisonGroupRankings);
  return {
    maxRank,
    currentRank,
    hasValue: true,
  };
};

const getResponse = async function (req, res, getRankingCallback) {
  try {
    const establishmentId = req.establishmentId;
    const { MainServiceFKValue } = await models.establishment.findbyId(establishmentId);
    const mainService = [1, 2, 8].includes(MainServiceFKValue) ? MainServiceFKValue : 0;

    const responseData = await getRankingCallback(establishmentId, mainService);
    res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getPayResponse = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const { MainServiceFKValue } = await models.establishment.findbyId(establishmentId);
    const mainService = [1, 2, 8].includes(MainServiceFKValue) ? MainServiceFKValue : 0;

    const data = {};
    data.careWorkerPay = await getPayRanking(establishmentId, mainService, CARE_WORKER_ID);
    data.seniorCareWorkerPay = await getPayRanking(establishmentId, mainService, SENIOR_CARE_WORKER_ID);
    data.registeredNursePay = await getPayRanking(establishmentId, mainService, REGISTERED_NURSE_ID);
    data.registeredManagerPay = await getPayRanking(establishmentId, mainService, REGISTERED_MANAGER_ID);
    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
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
  try {
    const establishmentId = req.establishmentId;
    const { MainServiceFKValue } = await models.establishment.findbyId(establishmentId);
    const mainService = [1, 2, 8].includes(MainServiceFKValue) ? MainServiceFKValue : 0;

    const data = {};
    data.careWorkerPay = await getPayRanking(establishmentId, mainService, CARE_WORKER_ID);
    data.seniorCareWorkerPay = await getPayRanking(establishmentId, mainService, SENIOR_CARE_WORKER_ID);
    data.registeredNursePay = await getPayRanking(establishmentId, mainService, REGISTERED_NURSE_ID);
    data.registeredManagerPay = await getPayRanking(establishmentId, mainService, REGISTERED_MANAGER_ID);
    data.turnover = await getTurnoverRanking(establishmentId);
    data.sickness = await getSicknessRanking(establishmentId);
    data.qualifications = await getQualificationsRanking(establishmentId);

    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
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
