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

// const CARE_WORKER_ID = 10;
// const SENIOR_CARE_WORKER_ID = 25;
// const REGISTERED_NURSE_ID = 23;
// const REGISTERED_MANAGER_ID = 22;

// const workerMap = new Map([
//   [10, 8],
//   [25, 7],
//   [23, 16],
//   [22, 4],
// ]);

const getPayRanking = async function (establishmentId) {
  return await getComparisonGroupAndCalculateRanking(
    establishmentId,
    models.benchmarksPay,
    getPay,
    (r) => r.pay,
    calculateRankDesc,
  );
};

// const getPayRanking = async function (establishmentId, mainService, workerId, cssr) {

//   const annualOrHourly = [CARE_WORKER_ID, SENIOR_CARE_WORKER_ID].includes(workerId) ? 'Hourly' : 'Annually';
//   const field = annualOrHourly === 'Hourly' ? 'AverageHourlyRate' : 'AverageAnnualFTE';
// const currentmetricValue = await getPay({ establishmentId, annualOrHourly, mainJob: workerId });

//   const groupRankings = await getComparisonGroupAndCalculateRanking(
//     establishmentId,
//     mainService,
//     'benchmarksPayByEstId',
//     [field, 'MainJobRole'],
//     currentmetricValue,
//     (r) => r[field],
//     goodCqcRankings
//     cssr,
//     workerId,
//   );

//   const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
//     establishmentId,
//     mainService,
//     'benchmarksPayByEstIdGoodOutstanding',
//     [field, 'MainJobRole'],
//     currentmetricValue,
//     (r) => r[field],
//     calculateRankAsc,
//     // cssr,
//     // workerId,
//   );

//   return { groupRankings, goodCqcRankings };
// };

const getQualificationsRanking = async function (establishmentId) {
  return await getComparisonGroupAndCalculateRanking(
    establishmentId,
    models.benchmarksQualifications,
    getQualifications,
    (r) => parseFloat(r.qualifications),
    calculateRankDesc,
  );
};

// const getQualificationsRanking = async function (establishmentId, mainService, cssr) {
//   const currentmetricValue = await getQualifications({ establishmentId });

//   const groupRankings = await getComparisonGroupAndCalculateRanking(
//     establishmentId,
//     mainService,
//     'benchmarksQualificationsByEstId',
//     ['Qualifications'],
//     currentmetricValue,
//     (r) => parseFloat(r.Qualifications),
//     goodCqcRankings
//     // cssr
//   );

//   const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
//     establishmentId,
//     mainService,
//     'benchmarksQualificationsByEstIdGoodOutstanding',
//     ['Qualifications'],
//     currentmetricValue,
//     (r) => parseFloat(r.Qualifications),
//     calculateRankAsc,
//     // cssr
//   );

//   return { groupRankings, goodCqcRankings };
// };

const getSicknessRanking = async function (establishmentId) {
  return await getComparisonGroupAndCalculateRanking(
    establishmentId,
    models.benchmarksSickness,
    getSickness,
    (r) => parseInt(r.sickness),
    calculateRankAsc,
  );
};

// const getSicknessRanking = async function (establishmentId, mainService, cssr) {
//   const currentmetricValue = await getSickness({ establishmentId });

//   const groupRankings = await getComparisonGroupAndCalculateRanking(
//     establishmentId,
//     mainService,
//     'benchmarksSicknessByEstId',
//     ['AverageNoOfSickDays'],
//     currentmetricValue,
//     (r) => parseInt(r.AverageNoOfSickDays),
//     calculateRankAsc
//     // cssr
//   );
//   const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
//     establishmentId,
//     mainService,
//     'benchmarksSicknessByEstIdGoodOutstanding',
//     ['AverageNoOfSickDays'],
//     currentmetricValue,
//     (r) => parseInt(r.AverageNoOfSickDays),
//     calculateRankAsc,
//     // cssr
//   );
//   return { groupRankings, goodCqcRankings };
// };

const getTurnoverRanking = async function (establishmentId) {
  return await getComparisonGroupAndCalculateRanking(
    establishmentId,
    models.benchmarksTurnover,
    getTurnover,
    (r) => parseFloat(r.turnover),
    calculateRankAsc,
  );
};

// const getTurnoverRanking = async function (establishmentId, mainService, cssr) {
//   const currentmetricValue = await getTurnover({ establishmentId });

//   const groupRankings = await getComparisonGroupAndCalculateRanking(
//     establishmentId,
//     mainService,
//     'benchmarksTurnoverByEstId',
//     ['TurnoverRate'],
//     currentmetricValue,
//     (r) => parseFloat(r.TurnoverRate),
//     calculateRankDesc,
//     cssr
//   );

//   const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
//     establishmentId,
//     mainService,
//     'benchmarksTurnoverByEstIdGoodOutstanding',
//     ['TurnoverRate'],
//     currentmetricValue,
//     (r) => parseFloat(r.TurnoverRate),
//     calculateRankDesc,
//     cssr
//   );
//   return { groupRankings, goodCqcRankings };
// };

const getVacancyRanking = async function (establishmentId, mainService, cssr) {
  const currentmetricValue = await getVacancies({ establishmentId });

  const groupRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksVacanciesByEstId',
    ['VacancyRate'],
    currentmetricValue,
    (r) => parseFloat(r.VacancyRate),
    calculateRankDesc,
    cssr,
  );

  const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksVacanciesByEstIdGoodOutstanding',
    ['VacancyRate'],
    currentmetricValue,
    (r) => parseFloat(r.VacancyRate),
    calculateRankDesc,
    cssr,
  );
  return { groupRankings, goodCqcRankings };
};

const getTimeInRoleRankings = async function (establishmentId, mainService, cssr) {
  const currentmetricValue = await getTimeInRole({ establishmentId });

  const groupRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksTimeInRoleByEstId',
    ['InRoleFor12MonthsPercentage'],
    currentmetricValue,
    (r) => parseFloat(r.InRoleFor12MonthsPercentage),
    calculateRankDesc,
    cssr,
  );

  const goodCqcRankings = await getComparisonGroupAndCalculateRanking(
    establishmentId,
    mainService,
    'benchmarksTimeInRoleByEstIdGoodOutstanding',
    ['InRoleFor12MonthsPercentage'],
    currentmetricValue,
    (r) => parseFloat(r.InRoleFor12MonthsPercentage),
    calculateRankDesc,
    cssr,
  );
  return { groupRankings, goodCqcRankings };
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
  const metric = await getMetricCallback({ establishmentId });
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

// const getResponse = async function (req, res, getRankingCallback) {
//   try {
//     const establishmentId = req.establishmentId;
//     const { MainServiceFKValue } = await models.establishment.findbyId(establishmentId);
//     const mainService = [1, 2, 8].includes(MainServiceFKValue) ? MainServiceFKValue : 0;

//     const responseData = await getRankingCallback(establishmentId, mainService);
//     res.status(200).json(responseData);
//   } catch (error) {
//     return res.status(500).json(error);
//   }
// };

const getResponse = async function (req, res, getRankingCallback) {
  try {
    const establishmentId = req.establishmentId;

    const responseData = await getRankingCallback(establishmentId);
    res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json(error);
  }
};

// const getPayResponse = async (req, res) => {
//   try {
//     const establishmentId = req.establishmentId;
//     const { MainServiceFKValue } = await models.establishment.findbyId(establishmentId);
//     const mainService = [1, 2, 8].includes(MainServiceFKValue) ? MainServiceFKValue : 0;

//     const data = {};
//     data.careWorkerPay = await getPayRanking(establishmentId, mainService, CARE_WORKER_ID);
//     data.seniorCareWorkerPay = await getPayRanking(establishmentId, mainService, SENIOR_CARE_WORKER_ID);
//     data.registeredNursePay = await getPayRanking(establishmentId, mainService, REGISTERED_NURSE_ID);
//     data.registeredManagerPay = await getPayRanking(establishmentId, mainService, REGISTERED_MANAGER_ID);
//     res.status(200).json(data);
//   } catch (error) {
//     return res.status(500).json(error);
//   }
// };

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

const getVacancyResponse = async (req, res) => {
  await getResponse(req, res, getVacancyRanking);
};

const getTimeInRoleResponse = async (req, res) => {
  await getResponse(req, res, getTimeInRoleRankings);
};

// const getRankingsResponse = async (req, res) => {
//   try {
//     const establishmentId = req.establishmentId;
//     const { MainServiceFKValue } = await models.establishment.findbyId(establishmentId);
//     const mainService = [1, 2, 8].includes(MainServiceFKValue) ? MainServiceFKValue : 0;
//     // const { mainService } = await models.establishment.findbyId(establishmentId);

//     // const mainServiceID = [1, 2, 8].includes(mainService.reportingID) ? mainService.reportingID : 0;
//     // const cssr = await models.cssr.getCSSRsFromEstablishmentId(establishmentId);

//     const data = { pay: {} };

//     data.pay.careWorkerPay = await getPayRanking(establishmentId, mainService, CARE_WORKER_ID);
//     data.pay.seniorCareWorkerPay = await getPayRanking(establishmentId, mainService, SENIOR_CARE_WORKER_ID);
//     data.pay.registeredNursePay = await getPayRanking(establishmentId, mainService, REGISTERED_NURSE_ID);
//     data.pay.registeredManagerPay = await getPayRanking(establishmentId, mainService, REGISTERED_MANAGER_ID);
//     data.turnover = await getTurnoverRanking(establishmentId, mainService);
//     data.sickness = await getSicknessRanking(establishmentId, mainService);
//     data.qualifications = await getQualificationsRanking(establishmentId, mainService);
//     data.vacancy = await getVacancyRanking(establishmentId, mainService);
//     data.timeInRole = await getTimeInRoleRankings(establishmentId, mainService);

//     res.status(200).json(data);
//   } catch (error) {
//     return res.status(500).json(error);
//   }
// };

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
router.route('/vacancy').get(getVacancyResponse);
router.route('/time_in_role').get(getTimeInRoleResponse);

module.exports = router;
module.exports.pay = getPayRanking;
module.exports.qualifications = getQualificationsRanking;
module.exports.sickness = getSicknessRanking;
module.exports.turnover = getTurnoverRanking;
module.exports.vacancy = getVacancyRanking;
module.exports.timeInRole = getTimeInRoleRankings;
