const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');
const clonedeep = require('lodash.clonedeep');
const rankings = require('./rankings');
const usage = require('./usage');
const { getPay, getQualifications, getSickness, getTurnover } = require('./benchmarksService');

const { hasPermission } = require('../../../utils/security/hasPermission');

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
  return await buildTile(establishmentId, benchmarkComparisonGroup, 'pay', getPay);
};

const qualifications = async (establishmentId, benchmarkComparisonGroup) => {
  return await buildTile(establishmentId, benchmarkComparisonGroup, 'qualifications', getQualifications);
};

const sickness = async (establishmentId, benchmarkComparisonGroup) => {
  return await buildTile(establishmentId, benchmarkComparisonGroup, 'sickness', getSickness);
};

const turnover = async (establishmentId, benchmarkComparisonGroup) => {
  return await buildTile(establishmentId, benchmarkComparisonGroup, 'turnover', getTurnover);
};

const buildTile = async (establishmentId, benchmarkComparisonGroup, key, getMetricCallback) => {
  const { value, stateMessage } = await getMetricCallback(establishmentId);
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
    comparisonGroupMetrics.lowTurnover = buildMetric(comparisonGroups[`${key}LowTurnover`]);
    comparisonGroupMetrics.staff = comparisonGroups[`${key}Staff`];
    comparisonGroupMetrics.workplaces = comparisonGroups[`${key}Workplaces`];
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

const viewBenchmarks = async (req, res) => {
  try {
    const establishmentId = req.establishmentId;
    const tiles = req.query.tiles ? req.query.tiles.split(',') : [];
    const reply = await getTiles(establishmentId, tiles);
    return res.status(200).json(reply);
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

// router.use('/', hasPermission('canViewBenchmarks'));
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
