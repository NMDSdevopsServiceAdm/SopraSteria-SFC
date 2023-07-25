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
  getVacancies,
  getTimeInRole,
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

const getSicknessRanking = async function (establishmentId, mainService) {
  const currentmetricValue = await getSickness({ establishmentId });

  const groupRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksSicknessByEstId',
    ['AverageNoOfSickDays'],
    currentmetricValue,
    (r) => parseInt(r.AverageNoOfSickDays),
    calculateRankAsc,
  );
  const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksSicknessByEstIdGoodOutstanding',
    ['AverageNoOfSickDays'],
    currentmetricValue,
    (r) => parseInt(r.AverageNoOfSickDays),
    calculateRankAsc,
  );
  return { groupRankings, goodCqcRankings };
};

const getTurnoverRanking = async function (establishmentId, mainService) {
  const currentmetricValue = await getTurnover({ establishmentId });

  const groupRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksTurnoverByEstId',
    ['TurnoverRate'],
    currentmetricValue,
    (r) => parseFloat(r.TurnoverRate),
    calculateRankDesc,
  );

  const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksTurnoverByEstIdGoodOutstanding',
    ['TurnoverRate'],
    currentmetricValue,
    (r) => parseFloat(r.TurnoverRate),
    calculateRankDesc,
  );
  return { groupRankings, goodCqcRankings };
};

const getVacancyRanking = async function (establishmentId, mainService) {
  const currentmetricValue = await getVacancies({ establishmentId });

  const groupRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksVacanciesByEstId',
    ['VacancyRate'],
    currentmetricValue,
    (r) => parseFloat(r.VacancyRate),
    calculateRankDesc,
  );

  const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksVacanciesByEstIdGoodOutstanding',
    ['VacancyRate'],
    currentmetricValue,
    (r) => parseFloat(r.VacancyRate),
    calculateRankDesc,
  );
  return { groupRankings, goodCqcRankings };
};

const getTimeInRoleRankings = async function (establishmentId, mainService) {
  const currentmetricValue = await getTimeInRole({ establishmentId });

  const groupRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksTimeInRoleByEstId',
    ['InRoleFor12MonthsPercentage'],
    currentmetricValue,
    (r) => parseFloat(r.InRoleFor12MonthsPercentage),
    calculateRankDesc,
  );

  const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksTimeInRoleByEstIdGoodOutstanding',
    ['InRoleFor12MonthsPercentage'],
    currentmetricValue,
    (r) => parseFloat(r.InRoleFor12MonthsPercentage),
    calculateRankDesc,
  );
  return { groupRankings, goodCqcRankings };
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
  const comparisonGroupRankings = await getComparisonGroupRankings({
    benchmarksModel: models[benchmarksModel],
    establishmentId,
    mainService,
    attributes,
    mainJob: workerId && workerMap.get(workerId),
  });

  const mappedComparisonGroupRankings = comparisonGroupRankings.map(mapComparisonGroupCallback).filter((a) => a);

  if (mappedComparisonGroupRankings.length === 0) {
    const values = [];
    if (!metric.stateMessage) {
      values.push({ value: metric.value, currentEst: true });
    }

    return {
      allValues: values,
      hasValue: false,
      stateMessage: 'no-comparison-data',
    };
  }

  const valuesData = mappedComparisonGroupRankings
    .sort((a, b) => b - a)
    .map((rank) => {
      return { value: rank, currentEst: false };
    });

  const maxRank = mappedComparisonGroupRankings.length + 1;
  if (metric.stateMessage) {
    return {
      allValues: valuesData,
      maxRank,
      hasValue: false,
      ...metric,
    };
  }

  const currentRank = await calculateRankingCallback(metric.value, mappedComparisonGroupRankings);
  valuesData.splice(currentRank - 1, 0, { value: metric.value, currentEst: true });

  return {
    maxRank,
    currentRank,
    hasValue: true,
    allValues: valuesData,
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

const getVacancyResponse = async (req, res) => {
  await getResponse(req, res, getVacancyRanking);
};

const getTimeInRoleResponse = async (req, res) => {
  await getResponse(req, res, getTimeInRoleRankings);
};

const getRankingsResponse = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const { mainService } = await models.establishment.findbyId(establishmentId);

    const mainServiceID = [1, 2, 8].includes(mainService.reportingID) ? mainService.reportingID : 0;

    const data = { pay: {} };

    data.pay.careWorkerPay = await getPayRanking(establishmentId, mainServiceID, CARE_WORKER_ID);
    data.pay.seniorCareWorkerPay = await getPayRanking(establishmentId, mainServiceID, SENIOR_CARE_WORKER_ID);
    data.pay.registeredNursePay = await getPayRanking(establishmentId, mainServiceID, REGISTERED_NURSE_ID);
    data.pay.registeredManagerPay = await getPayRanking(establishmentId, mainServiceID, REGISTERED_MANAGER_ID);
    data.turnover = await getTurnoverRanking(establishmentId, mainServiceID);
    data.sickness = await getSicknessRanking(establishmentId, mainServiceID);
    data.qualifications = await getQualificationsRanking(establishmentId, mainServiceID);
    data.vacancy = await getVacancyRanking(establishmentId, mainServiceID);
    data.timeInRole = await getTimeInRoleRankings(establishmentId, mainServiceID);

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
router.route('/vacancy').get(getVacancyResponse);
router.route('/time_in_role').get(getTimeInRoleResponse);

module.exports = router;
module.exports.pay = getPayRanking;
module.exports.qualifications = getQualificationsRanking;
module.exports.sickness = getSicknessRanking;
module.exports.turnover = getTurnoverRanking;
module.exports.vacancy = getVacancyRanking;
module.exports.timeInRole = getTimeInRoleRankings;
