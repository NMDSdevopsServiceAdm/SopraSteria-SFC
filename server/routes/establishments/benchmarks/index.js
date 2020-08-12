const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  const tiles = req.query.tiles.split(',');

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

    reply = await comparisonGroupData(reply, benchmarkComparisonGroup);
    return res.status(200).json(reply);
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

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
  const whereClause = { MainJobFkValue: 10, archived: false };
  const establishmentWorkersPay = await models.establishment.workers(establishmentId, whereClause, ['AnnualHourlyPayRate']);
  let averagePaidAmount = 0;
  let stateMessage = '';
  if (establishmentWorkersPay) {
    let paidAmount = 0;
    await Promise.all(establishmentWorkersPay.workers.map(async worker => {
      paidAmount = paidAmount + Number(worker.AnnualHourlyPayRate);
      return paidAmount;
    }));
    averagePaidAmount = paidAmount / establishmentWorkersPay.workers.length;
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

const turnover = async (establishmentId) => {
  const establishment = await models.establishment.turnOverData(establishmentId);
  let percentOfPermTemp = 0;
  let stateMessage = '';

  if (establishment && establishment.NumberOfStaffValue > 0 &&
    establishment.LeaversValue != null &&
    establishment.workers.length == establishment.NumberOfStaffValue ){
    let permOrTempCount = 0;
    const contractTypesNeeded= ['Permanent','Temporary'];
    await Promise.all(establishment.workers.map(async worker => {
      if (contractTypesNeeded.includes(worker.ContractValue)) {  // SocialCareQualificationFkValue 2 is level 1
        return permOrTempCount++;
      }
      }));
      percentOfPermTemp = (permOrTempCount / establishment.workers.length);
  }else{
    stateMessage = 'no-workers';
  }
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
  const qualsWorkers = await models.worker.specificJobs(establishmentId, models.services.careProvidingStaff);
  let percentOfHigherQuals = 0;
  let stateMessage = '';
  if (qualsWorkers.length) {
    let higherQualCount = 0;
    await Promise.all(qualsWorkers.map(async worker => {
      if (worker.SocialCareQualificationFkValue > 2) {  // SocialCareQualificationFkValue 2 is level 1
        return higherQualCount++;
      }
    }));
    percentOfHigherQuals = (higherQualCount / qualsWorkers.length);
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

module.exports.comparisonGroupData = comparisonGroupData;
