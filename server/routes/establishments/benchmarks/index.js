const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');
const clonedeep = require('lodash.clonedeep');
const rankings = require('./rankings');
const { getPay, getQualifications, getTurnover } = require('./benchmarksService');

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

const getTiles = async (establishmentId, tiles) => {
  let benchmarkComparisonGroup = await models.benchmarks.getBenchmarkData(establishmentId);
  let reply = {
    meta: {},
  };
  if (tiles.includes('pay')) reply.pay = await pay(establishmentId, benchmarkComparisonGroup);
  if (tiles.includes('sickness')) reply.sickness = await sickness(establishmentId, benchmarkComparisonGroup);
  if (tiles.includes('qualifications'))
    reply.qualifications = await qualifications(establishmentId, benchmarkComparisonGroup);
  if (tiles.includes('turnover')) reply.turnover = await turnover(establishmentId, benchmarkComparisonGroup);

  reply.meta = await getMetaData(benchmarkComparisonGroup);
  return reply;
};

const getMetaData = async (benchmarkComparisonGroup) => {
  return {
    workplaces: benchmarkComparisonGroup ? benchmarkComparisonGroup.workplaces : 0,
    staff: benchmarkComparisonGroup ? benchmarkComparisonGroup.staff : 0,
    lastUpdated: await models.dataImports.benchmarksLastUpdated(),
  };
};

const pay = async (establishmentId, benchmarkComparisonGroup) => {
  async function payTileLogic(establishmentId) {
    const { value, stateMessage } = await getPay(establishmentId);
    return {
      value: value ? value : 0,
      stateMessage: stateMessage ? stateMessage : '',
    };
  }
  return await buildTile(establishmentId, benchmarkComparisonGroup, 'pay', payTileLogic);
};

const qualifications = async (establishmentId, benchmarkComparisonGroup) => {
  async function qualificationsTileLogic(establishmentId) {
    const { value, stateMessage } = await getQualifications(establishmentId);
    return {
      value: value ? value : 0,
      stateMessage: stateMessage ? stateMessage : '',
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

const turnover = async (establishmentId, benchmarkComparisonGroup) => {
  async function turnoverTileLogic(establishmentId) {
    const { value, stateMessage } = await getTurnover(establishmentId);
    return {
      value: value ? value : 0,
      stateMessage: stateMessage ? stateMessage : '',
    };
  }
  return await buildTile(establishmentId, benchmarkComparisonGroup, 'turnover', turnoverTileLogic);
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

router.route('/').get(async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const tiles = req.query.tiles ? req.query.tiles.split(',') : [];
    const reply = await getTiles(establishmentId, tiles);
    return res.status(200).json(reply);
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

router.use('/rankings', rankings);

module.exports = router;
module.exports.pay = pay;
module.exports.sickness = sickness;
module.exports.qualifications = qualifications;
module.exports.turnover = turnover;
module.exports.buildComparisonGroupMetrics = buildComparisonGroupMetrics;
module.exports.getMetaData = getMetaData;
