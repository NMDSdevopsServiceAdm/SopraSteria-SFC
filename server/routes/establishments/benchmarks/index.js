const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');
const clonedeep = require('lodash.clonedeep');
const rankings = require('./rankings');
const comparisonJson = {
  value: 0,
  hasValue: false,
  stateMessage: 'no-data',
};

const comparisonGroupsJson = {
  comparisonGroup: clonedeep(comparisonJson),
  goodCqc: clonedeep(comparisonJson),
  lowTurnover: clonedeep(comparisonJson),
};

router.use('/rankings', rankings);

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  const tiles = req.query.tiles ? req.query.tiles.split(',') : [];

  try {
    let benchmarkComparisonGroup = await models.establishment.getBenchmarkData(establishmentId);
    benchmarkComparisonGroup = benchmarkComparisonGroup.mainService
      ? benchmarkComparisonGroup.mainService.benchmarksData[0]
      : null;
    let reply = {
      tiles: {},
      meta: {},
    };
    if (tiles.includes('pay')) reply.tiles.pay = await pay(establishmentId, benchmarkComparisonGroup);
    if (tiles.includes('sickness')) reply.tiles.sickness = await sickness(establishmentId, benchmarkComparisonGroup);
    if (tiles.includes('qualifications'))
      reply.tiles.qualifications = await qualifications(establishmentId, benchmarkComparisonGroup);
    if (tiles.includes('turnover')) reply.tiles.turnover = await turnover(establishmentId, benchmarkComparisonGroup);

    reply.meta = await getMetaData(benchmarkComparisonGroup);
    return res.status(200).json(reply);
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

const getMetaData = async (benchmarkComparisonGroup) => {
  return {
    workplaces: benchmarkComparisonGroup ? benchmarkComparisonGroup.workplaces : 0,
    staff: benchmarkComparisonGroup ? benchmarkComparisonGroup.staff : 0,
    lastUpdated: await models.dataImports.benchmarksLastUpdated(),
  };
};

const buildComparisonGroupMetrics = (key, comparisonGroups) => {
  const comparisonGroupMetrics = clonedeep(comparisonGroupsJson);
  if (comparisonGroups) {
    comparisonGroupMetrics.comparisonGroup = buildMetric(comparisonGroups[key]);
    comparisonGroupMetrics.goodCqc = buildMetric(comparisonGroups[`${key}GoodCqc`]);
    comparisonGroupMetrics.lowTurnover = buildMetric(comparisonGroups[`${key}LowTurnover`]);
    comparisonGroupMetrics.staff = comparisonGroups[`${key}Staff`];
    comparisonGroupMetrics.workplaces = comparisonGroups[`${key}Workplaces`];
  }
  return comparisonGroupMetrics;
};

const buildMetric = (metricValue) => {
  const comparisonGroup = clonedeep(comparisonJson);
  comparisonGroup.value = metricValue ? parseFloat(metricValue) : 0;
  comparisonGroup.hasValue = metricValue !== null;
  if (comparisonGroup.hasValue) {
    delete comparisonGroup.stateMessage;
  }
  return comparisonGroup;
};

const pay = async (establishmentId, benchmarkComparisonGroup) => {
  let value = 0;
  let stateMessage = '';

  const averageHourlyPay = await models.worker.averageHourlyPay(establishmentId);
  if (averageHourlyPay.amount !== null) {
    value = parseInt(averageHourlyPay.amount * 100);
  } else {
    stateMessage = 'no-workers';
  }

  const json = {
    workplaceValue: {
      value,
      hasValue: stateMessage.length === 0,
    },
    ...buildComparisonGroupMetrics('pay', benchmarkComparisonGroup),
  };
  if (stateMessage.length) json.workplaceValue.stateMessage = stateMessage;
  return json;
};

const turnoverGetData = async (establishmentId) => {
  const establishment = await models.establishment.turnOverData(establishmentId);
  const workerCount = await models.worker.countForEstablishment(establishmentId);
  if (!establishment || establishment.NumberOfStaffValue === 0 || workerCount !== establishment.NumberOfStaffValue) {
    return { percentOfPermTemp: 0, stateMessage: 'no-workers' };
  }

  if (establishment.LeaversValue === "Don't know" || !establishment.LeaversValue) {
    return { percentOfPermTemp: 0, stateMessage: 'no-data' };
  }

  const permTemptCount = await models.worker.permAndTempCountForEstablishment(establishmentId);
  const leavers = await models.establishmentJobs.leaversForEstablishment(establishmentId);

  if (permTemptCount === 0) {
    return { percentOfPermTemp: 0, stateMessage: 'no-permTemp' };
  }
  if (establishment.LeaversValue === 'None') {
    return { percentOfPermTemp: 0, stateMessage: '' };
  }
  const percentOfPermTemp = leavers / permTemptCount;
  if (percentOfPermTemp > 9.95) {
    return { percentOfPermTemp: 0, stateMessage: 'check-data' };
  }
  return { percentOfPermTemp, stateMessage: '' };
};

const turnover = async (establishmentId, benchmarkComparisonGroup) => {
  const { percentOfPermTemp, stateMessage } = await turnoverGetData(establishmentId);
  const json = {
    workplaceValue: {
      value: percentOfPermTemp,
      hasValue: stateMessage.length === 0,
    },
    ...buildComparisonGroupMetrics('turnover', benchmarkComparisonGroup),
  };
  if (stateMessage.length) json.workplaceValue.stateMessage = stateMessage;
  return json;
};

const qualifications = async (establishmentId, benchmarkComparisonGroup) => {
  const noquals = await models.worker.specificJobsAndSocialCareQuals(
    establishmentId,
    models.services.careProvidingStaff,
  );
  const quals = await models.worker.specificJobsAndNoSocialCareQuals(
    establishmentId,
    models.services.careProvidingStaff,
  );
  const denominator = noquals + quals;
  let percentOfHigherQuals = 0;
  let stateMessage = '';
  if (denominator > 0) {
    let higherQualCount = await models.worker.benchmarkQualsCount(establishmentId, models.services.careProvidingStaff);
    percentOfHigherQuals = higherQualCount / denominator;
  } else {
    stateMessage = 'no-workers';
  }
  const json = {
    workplaceValue: {
      value: percentOfHigherQuals,
      hasValue: stateMessage.length === 0,
    },
    ...buildComparisonGroupMetrics('qualifications', benchmarkComparisonGroup),
  };
  if (stateMessage.length) json.workplaceValue.stateMessage = stateMessage;
  return json;
};

const sickness = async (establishmentId, benchmarkComparisonGroup) => {
  const whereClause = { DaysSickValue: 'Yes', archived: false };
  const establishmentWorkers = await models.establishment.workers(establishmentId, whereClause, ['DaysSickDays']);
  let averageSickDays = 0;
  let stateMessage = '';
  if (establishmentWorkers) {
    let sickness = 0;
    await Promise.all(
      establishmentWorkers.workers.map(async (worker) => {
        sickness = sickness + Number(worker.DaysSickDays);
        return sickness;
      }),
    );
    averageSickDays = Math.round(sickness / establishmentWorkers.workers.length);
  } else {
    stateMessage = 'no-workers';
  }
  const json = {
    workplaceValue: {
      value: averageSickDays,
      hasValue: stateMessage.length === 0,
    },
    ...buildComparisonGroupMetrics('sickness', benchmarkComparisonGroup),
  };
  if (stateMessage.length) json.workplaceValue.stateMessage = stateMessage;
  return json;
};

module.exports = router;
module.exports.pay = pay;
module.exports.sickness = sickness;
module.exports.qualifications = qualifications;
module.exports.turnover = turnover;
module.exports.buildComparisonGroupMetrics = buildComparisonGroupMetrics;
module.exports.getMetaData = getMetaData;
