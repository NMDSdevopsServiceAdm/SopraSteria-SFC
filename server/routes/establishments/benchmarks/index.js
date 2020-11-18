const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');
const clonedeep = require('lodash.clonedeep');
const rankings = require('./rankings');
const getTurnover = require('./benchmarksService').getTurnover;

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
      meta: {},
    };
    if (tiles.includes('pay')) reply.pay = await pay(establishmentId, benchmarkComparisonGroup);
    if (tiles.includes('sickness')) reply.sickness = await sickness(establishmentId, benchmarkComparisonGroup);
    if (tiles.includes('qualifications'))
      reply.qualifications = await qualifications(establishmentId, benchmarkComparisonGroup);
    if (tiles.includes('turnover')) reply.turnover = await turnover(establishmentId, benchmarkComparisonGroup);

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

const pay = async (establishmentId, benchmarkComparisonGroup) => {
  async function payTileLogic(establishmentId) {
    let value = 0;
    let stateMessage = '';
    const averageHourlyPay = await models.worker.averageHourlyPay(establishmentId);
    if (averageHourlyPay.amount !== null) {
      value = parseInt(averageHourlyPay.amount * 100);
    } else {
      stateMessage = 'no-pay-data';
    }
    return {
      value,
      stateMessage,
    };
  }
  return await buildTile(establishmentId, benchmarkComparisonGroup, 'pay', payTileLogic);
};

const turnover = async (establishmentId, benchmarkComparisonGroup) => {
  async function turnoverTileLogic(establishmentId) {
    const { percentOfPermTemp, stateMessage } = await getTurnover(establishmentId);
    return {
      value: percentOfPermTemp ? percentOfPermTemp : 0,
      stateMessage: stateMessage ? stateMessage : '',
    };
  }
  return await buildTile(establishmentId, benchmarkComparisonGroup, 'turnover', turnoverTileLogic);
};

const qualifications = async (establishmentId, benchmarkComparisonGroup) => {
  async function qualificationsTileLogic(establishmentId) {
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
      let higherQualCount = await models.worker.benchmarkQualsCount(
        establishmentId,
        models.services.careProvidingStaff,
      );
      percentOfHigherQuals = higherQualCount / denominator;
    } else {
      stateMessage = 'no-qualifications-data';
    }
    return {
      value: percentOfHigherQuals,
      stateMessage,
    };
  }
  return await buildTile(establishmentId, benchmarkComparisonGroup, 'qualifications', qualificationsTileLogic);
};

const sickness = async (establishmentId, benchmarkComparisonGroup) => {
  async function sicknessTileLogic(establishmentId) {
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
      stateMessage = 'no-sickness-data';
    }
    return {
      value: averageSickDays,
      stateMessage,
    };
  }
  return await buildTile(establishmentId, benchmarkComparisonGroup, 'sickness', sicknessTileLogic);
};

const buildTile = async (establishmentId, benchmarkComparisonGroup, key, buildTileCallback) => {
  const { value, stateMessage } = await buildTileCallback(establishmentId);
  const json = {
    workplaceValue: {
      value,
      hasValue: stateMessage.length === 0,
    },
    ...buildComparisonGroupMetrics(key, benchmarkComparisonGroup),
  };
  if (stateMessage.length) json.workplaceValue.stateMessage = stateMessage;
  return json;
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

module.exports = router;
module.exports.pay = pay;
module.exports.sickness = sickness;
module.exports.qualifications = qualifications;
module.exports.turnover = turnover;
module.exports.buildComparisonGroupMetrics = buildComparisonGroupMetrics;
module.exports.getMetaData = getMetaData;
