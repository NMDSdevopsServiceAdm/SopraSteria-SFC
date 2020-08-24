const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  const tiles = req.query.tiles ? req.query.tiles.split(',') : [];

  try {
    let benchmarkComparisonGroup = await models.establishment.getBenchmarkData(establishmentId);
    benchmarkComparisonGroup = benchmarkComparisonGroup.mainService ? benchmarkComparisonGroup.mainService.benchmarksData[0] : null;
    let reply = {
      tiles: {},
      meta: {}
    };
    if (tiles.includes('pay')) reply.tiles.pay = await pay(establishmentId);
    if (tiles.includes('sickness')) reply.tiles.sickness = await sickness(establishmentId);
    if (tiles.includes('qualifications')) reply.tiles.qualifications = await qualifications(establishmentId);
    if (tiles.includes('turnover')) reply.tiles.turnover = await turnover(establishmentId);

    reply = await comparisonGroupData(reply, benchmarkComparisonGroup);
    reply = await getMetaData(reply, benchmarkComparisonGroup);
    return res.status(200).json(reply);
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});
const getMetaData = async (reply,benchmarkComparisonGroup) => {
  if (!benchmarkComparisonGroup) {
    reply.meta.workplaces = 0;
    reply.meta.staff = 0;
    return reply;
  }
  reply.meta.workplaces = benchmarkComparisonGroup.workplaces;
  reply.meta.staff = benchmarkComparisonGroup.staff;
  return reply;

};
const comparisonGroupData = async (reply, benchmarkComparisonGroup) => {
  Object.keys(reply.tiles).map(key => {
    if (!benchmarkComparisonGroup) {
      reply.tiles[key].comparisonGroup.value = 0;
      reply.tiles[key].comparisonGroup.hasValue = false;
      reply.tiles[key].comparisonGroup.stateMessage = 'no-data';
    } else {
      reply.tiles[key].comparisonGroup.value = benchmarkComparisonGroup[key] ? benchmarkComparisonGroup[key] : 0;
      reply.tiles[key].comparisonGroup.hasValue = !!benchmarkComparisonGroup[key];
      if (!benchmarkComparisonGroup[key]) {
        reply.tiles[key].comparisonGroup.stateMessage = 'no-data';
      }
    }
  });
  return reply;
};
const pay = async (establishmentId) => {

  const careworkersWithHourlyPayCount = await models.worker.careworkersWithHourlyPayCount(establishmentId);
  let averagePaidAmount = 0;
  let stateMessage = '';
  if (careworkersWithHourlyPayCount > 0) {
    let paidAmount = await models.worker.careworkersTotalHourlyPaySum(establishmentId);
    averagePaidAmount = (paidAmount*100) / careworkersWithHourlyPayCount;
  } else {
    stateMessage = 'no-workers';
  }
  const json = {
    workplaceValue: {
      value: averagePaidAmount,
      hasValue: stateMessage.length === 0
    },
    comparisonGroup: {
      value: 0,
      hasValue: false
    }
  };
  if (stateMessage.length) json.workplaceValue.stateMessage = stateMessage;
  return json;
};
const turnoverGetData = async (establishmentId) => {
  const establishment = await models.establishment.turnOverData(establishmentId);
  const workerCount = await models.worker.countForEstablishment(establishmentId);
  if (!establishment || establishment.NumberOfStaffValue === 0 ||
    workerCount !== establishment.NumberOfStaffValue) {
    return { percentOfPermTemp: 0, stateMessage: 'no-workers' };
  }
  if (establishment.LeaversValue === 'Don\'t know' || !establishment.LeaversValue) {
    return { percentOfPermTemp: 0, stateMessage: 'no-data' };
  }
  if (establishment.LeaversValue === 'None') {
    return { percentOfPermTemp: 0,stateMessage: '' };
  }
  const permTemptCount = await models.worker.permAndTempCountForEstablishment(establishmentId);
  const leavers = await models.establishmentJobs.leaversForEstablishment(establishmentId);
  if (permTemptCount === 0 ){
    return { percentOfPermTemp: 0 , stateMessage: 'no-permTemp' };
  }
  const percentOfPermTemp = (leavers / permTemptCount);
  if (percentOfPermTemp > 9.95) {
    return { percentOfPermTemp: 0, stateMessage: 'check-data' };
  }
  return { percentOfPermTemp, stateMessage: '' };
};
const turnover = async (establishmentId) => {
  const { percentOfPermTemp, stateMessage } = await turnoverGetData(establishmentId);
  const json = {
    workplaceValue: {
      value: percentOfPermTemp,
      hasValue: stateMessage.length === 0
    },
    comparisonGroup: {
      value: 0,
      hasValue: false
    }
  };
  if (stateMessage.length) json.workplaceValue.stateMessage = stateMessage;
  return json;
};
const qualifications = async (establishmentId) => {
  const noquals = await models.worker.specificJobsAndSocialCareQuals(establishmentId, models.services.careProvidingStaff);
  const quals = await models.worker.specificJobsAndNoSocialCareQuals(establishmentId, models.services.careProvidingStaff);
  const denominator = noquals + quals;
  let percentOfHigherQuals = 0;
  let stateMessage = '';
  if (denominator > 0) {
    let higherQualCount =  await models.worker.benchmarkQualsCount(establishmentId, models.services.careProvidingStaff);
    percentOfHigherQuals = (higherQualCount / denominator);
  } else {
    stateMessage = 'no-workers';
  }
  const json = {
    workplaceValue: {
      value: percentOfHigherQuals,
      hasValue: stateMessage.length === 0
    },
    comparisonGroup: {
      value: 0,
      hasValue: false
    }
  };
  if (stateMessage.length) json.workplaceValue.stateMessage = stateMessage;
  return json;
};
const sickness = async (establishmentId) => {
  const whereClause = { DaysSickValue: 'Yes', archived: false };
  const establishmentWorkers = await models.establishment.workers(establishmentId, whereClause, ['DaysSickDays']);
  let averageSickDays = 0;
  let stateMessage = '';
  if (establishmentWorkers) {
    let sickness = 0;
    await Promise.all(establishmentWorkers.workers.map(async worker => {
      sickness = sickness + Number(worker.DaysSickDays);
      return sickness;
    }));
    averageSickDays = Math.round(sickness / establishmentWorkers.workers.length);
  } else {
    stateMessage = 'no-workers';
  }
  const json = {
    workplaceValue: {
      value: averageSickDays,
      hasValue: stateMessage.length === 0
    },
    comparisonGroup: {
      value: 0,
      hasValue: false
    }
  };
  if (stateMessage.length) json.workplaceValue.stateMessage = stateMessage;
  return json;
};
module.exports = router;
module.exports.pay = pay;
module.exports.sickness = sickness;
module.exports.qualifications = qualifications;
module.exports.turnover = turnover;
module.exports.comparisonGroupData = comparisonGroupData;
module.exports.getMetaData = getMetaData;
