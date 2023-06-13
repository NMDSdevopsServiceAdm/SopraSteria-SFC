const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');
const clonedeep = require('lodash.clonedeep');
const rankings = require('./rankings');
const usage = require('./usage');
const benchmarksService = require('./benchmarksService');

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

const comparisonJson = {
  value: 0,
  hasValue: false,
  stateMessage: 'no-data',
};

const comparisonGroupsJson = {
  comparisonGroup: clonedeep(comparisonJson),
  goodCqc: clonedeep(comparisonJson),
};

const pay = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'pay', benchmarksService.getPay);
};

const qualifications = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'qualifications', benchmarksService.getQualifications);
};

const sickness = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'sickness', benchmarksService.getSickness);
};

const turnover = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'turnover', benchmarksService.getTurnover);
};

const vacancies = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'vacancies', benchmarksService.getVacancies);
};

const timeInRole = async (params, benchmarkComparisonGroup) => {
  return await buildTile(params, benchmarkComparisonGroup, 'timeInRole', benchmarksService.getTimeInRole);
};

const buildTile = async (params, benchmarkComparisonGroup, key, getMetricCallback) => {
  const { value, stateMessage } = await getMetricCallback(params);
  const hasValue = !stateMessage || stateMessage.length === 0;
  const json = {
    workplaceValue: {
      value: value ? value : 0,
      hasValue,
    },
    ...buildComparisonGroupMetrics(key, benchmarkComparisonGroup),
  };
  if (!hasValue) json.workplaceValue.stateMessage = stateMessage;
  return json;
};

const buildComparisonGroupMetrics = (key, comparisonGroups) => {
  const comparisonGroupMetrics = clonedeep(comparisonGroupsJson);
  if (comparisonGroups) {
    comparisonGroupMetrics.comparisonGroup = buildMetric(comparisonGroups[key]);
    comparisonGroupMetrics.goodCqc = buildMetric(comparisonGroups[`${key}GoodCqc`]);
  }
  return comparisonGroupMetrics;
};

const buildMetric = (metricValue) => {
  const comparisonGroup = clonedeep(comparisonJson);
  comparisonGroup.value = metricValue !== undefined && metricValue !== null ? parseFloat(metricValue) : 0;
  comparisonGroup.hasValue = metricValue !== undefined && metricValue !== null;
  if (comparisonGroup.hasValue) {
    delete comparisonGroup.stateMessage;
  }
  return comparisonGroup;
};

const payBenchmarks = async (establishmentId, mainService, workerId) => {
  const { comparisonGroup, comparisonGoodCqcGroup } = await getComparisonGroups(
    establishmentId,
    mainService,
    'benchmarksPayByLAAndService',
    ['AverageHourlyRate', 'AverageAnnualFTE', 'MainJobRole', 'BaseWorkers'],
    workerId,
  );

  const annualOrHourly = [CARE_WORKER_ID, SENIOR_CARE_WORKER_ID].includes(workerId) ? 'Hourly' : 'Annually';

  const field = annualOrHourly === 'Hourly' ? 'AverageHourlyRate' : 'AverageAnnualFTE';
  const comparisonGroups = {
    pay: comparisonGroup && comparisonGroup[field],
    payGoodCqc: comparisonGoodCqcGroup && comparisonGoodCqcGroup[field],
  };

  return await pay({ establishmentId, mainJob: workerId, annualOrHourly }, comparisonGroups);
};

const turnoverBenchmarks = async (establishmentId, mainService) => {
  const { comparisonGroup, comparisonGoodCqcGroup } = await getComparisonGroups(
    establishmentId,
    mainService,
    'benchmarksTurnoverByLAAndService',
    ['TurnoverRate'],
  );

  const comparisonGroups = {
    turnover: comparisonGroup && comparisonGroup.TurnoverRate,
    turnoverGoodCqc: comparisonGoodCqcGroup && comparisonGoodCqcGroup.TurnoverRate,
  };

  return await turnover({ establishmentId }, comparisonGroups);
};

const vacanciesBenchmarks = async (establishmentId, mainService) => {
  const { comparisonGroup, comparisonGoodCqcGroup } = await getComparisonGroups(
    establishmentId,
    mainService,
    'benchmarksVacanciesByLAAndService',
    ['VacancyRate'],
  );

  const comparisonGroups = {
    vacancies: comparisonGroup && comparisonGroup.VacancyRate,
    vacanciesGoodCqc: comparisonGoodCqcGroup && comparisonGoodCqcGroup.VacancyRate,
  };

  return await vacancies({ establishmentId }, comparisonGroups);
};

const qualificationsBenchmarks = async (establishmentId, mainService) => {
  const { comparisonGroup, comparisonGoodCqcGroup } = await getComparisonGroups(
    establishmentId,
    mainService,
    'benchmarksQualificationsByLAAndService',
    ['Qualifications'],
  );

  const comparisonGroups = {
    qualifications: comparisonGroup && comparisonGroup.Qualifications,
    qualificationsGoodCqc: comparisonGoodCqcGroup && comparisonGoodCqcGroup.Qualifications,
  };

  return await qualifications({ establishmentId }, comparisonGroups);
};

const sicknessBenchmarks = async (establishmentId, mainService) => {
  const { comparisonGroup, comparisonGoodCqcGroup } = await getComparisonGroups(
    establishmentId,
    mainService,
    'benchmarksSicknessByLAAndService',
    ['AverageNoOfSickDays'],
  );

  const comparisonGroups = {
    sickness: comparisonGroup && comparisonGroup.AverageNoOfSickDays,
    sicknessGoodCqc: comparisonGoodCqcGroup && comparisonGoodCqcGroup.AverageNoOfSickDays,
  };

  return await sickness({ establishmentId }, comparisonGroups);
};

const timeInRoleBenchmarks = async (establishmentId, mainService) => {
  const { comparisonGroup, comparisonGoodCqcGroup } = await getComparisonGroups(
    establishmentId,
    mainService,
    'benchmarksTimeInRoleByLAAndService',
    ['InRoleFor12MonthsPercentage'],
  );

  const comparisonGroups = {
    timeInRole: comparisonGroup && comparisonGroup.InRoleFor12MonthsPercentage,
    timeInRoleGoodCqc: comparisonGoodCqcGroup && comparisonGoodCqcGroup.InRoleFor12MonthsPercentage,
  };

  return await timeInRole({ establishmentId }, comparisonGroups);
};

const getComparisonGroups = async (establishmentId, mainService, benchmarksModel, attributes, workerId) => {
  const comparisonGroup = await benchmarksService.getComparisonData(
    models[benchmarksModel],
    establishmentId,
    mainService,
    attributes,
    workerId && workerMap.get(workerId),
  );

  const comparisonGoodCqcGroup = await benchmarksService.getComparisonData(
    models[`${benchmarksModel}GoodOutstanding`],
    establishmentId,
    mainService,
    attributes,
    workerId && workerMap.get(workerId),
  );
  return { comparisonGroup, comparisonGoodCqcGroup };
};

const getBenchmarksData = async (establishmentId, mainService) => {
  const data = {
    meta: {},
  };

  data.careWorkerPay = await payBenchmarks(establishmentId, mainService, CARE_WORKER_ID);
  data.seniorCareWorkerPay = await payBenchmarks(establishmentId, mainService, SENIOR_CARE_WORKER_ID);
  data.registeredNursePay = await payBenchmarks(establishmentId, mainService, REGISTERED_NURSE_ID);
  data.registeredManagerPay = await payBenchmarks(establishmentId, mainService, REGISTERED_MANAGER_ID);
  data.vacancyRate = await vacanciesBenchmarks(establishmentId, mainService);
  data.turnoverRate = await turnoverBenchmarks(establishmentId, mainService);
  data.qualifications = await qualificationsBenchmarks(establishmentId, mainService);
  data.sickness = await sicknessBenchmarks(establishmentId, mainService);
  data.timeInRole = await timeInRoleBenchmarks(establishmentId, mainService);

  data.meta = await getMetaData(establishmentId, mainService);
  return data;
};

const getMetaData = async (establishmentId, mainService) => {
  const benchmarksComparisonGroup = await models.benchmarksEstablishmentsAndWorkers.getComparisonData(
    establishmentId,
    mainService,
  );

  const benchmarksComparisonGroupGoodOutstanding =
    await models.benchmarksEstablishmentsAndWorkersGoodOutstanding.getComparisonData(establishmentId, mainService);

  return {
    workplaces: benchmarksComparisonGroup ? benchmarksComparisonGroup.workplaces : 0,
    staff: benchmarksComparisonGroup ? benchmarksComparisonGroup.staff : 0,
    workplacesGoodCqc: benchmarksComparisonGroupGoodOutstanding
      ? benchmarksComparisonGroupGoodOutstanding.BaseEstablishments
      : 0,
    staffGoodCqc: benchmarksComparisonGroupGoodOutstanding ? benchmarksComparisonGroupGoodOutstanding.WorkerCount : 0,
    lastUpdated: await models.dataImports.benchmarksLastUpdated(),
    localAuthority: benchmarksComparisonGroup ? benchmarksComparisonGroup.localAuthority : null,
  };
};

const viewBenchmarks = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const { mainService } = await models.establishment.findbyId(establishmentId);

    const mainServiceID = [1, 2, 8].includes(mainService.reportingID) ? mainService.reportingID : 0;
    const benchmarksData = await getBenchmarksData(establishmentId, mainServiceID);

    return res.status(200).json(benchmarksData);
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

router.route('/').get(viewBenchmarks);

router.use('/rankings', rankings);
router.use('/usage', usage);

module.exports = router;
module.exports.pay = pay;
module.exports.qualifications = qualifications;
module.exports.sickness = sickness;
module.exports.turnover = turnover;
module.exports.buildComparisonGroupMetrics = buildComparisonGroupMetrics;
module.exports.getMetaData = getMetaData;
module.exports.getBenchmarksData = getBenchmarksData;
module.exports.payBenchmarks = payBenchmarks;
module.exports.turnoverBenchmarks = turnoverBenchmarks;
module.exports.vacanciesBenchmarks = vacanciesBenchmarks;
module.exports.qualificationsBenchmarks = qualificationsBenchmarks;
module.exports.sicknessBenchmarks = sicknessBenchmarks;
module.exports.timeInRoleBenchmarks = timeInRoleBenchmarks;
module.exports.viewBenchmarks = viewBenchmarks;
