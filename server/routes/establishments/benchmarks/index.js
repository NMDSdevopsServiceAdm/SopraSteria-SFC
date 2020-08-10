const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../../models');
const util = require("util");

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  const tiles = req.query.tiles ? req.query.tiles.split(',') : ['pay'];
  try{
    let benchmarkComparisonGroup = await models.establishment.getBenchmarkData(establishmentId);
    benchmarkComparisonGroup =  benchmarkComparisonGroup.mainService ? benchmarkComparisonGroup.mainService.benchmarksData[0] : null;
    let reply = {
      tiles: {

      },
      meta: {

      }
    };
    if (tiles.includes('pay')) reply.tiles.pay = await pay(establishmentId);;

    reply = await comparisonGroupData(reply,benchmarkComparisonGroup);
    return res.status(200).json(reply);
  }catch(err){
    console.error(err);
    return res.status(503).send();
  }
});

const comparisonGroupData = async (reply,benchmarkComparisonGroup) => {
  Object.keys(reply.tiles).map(key => {
    if (!benchmarkComparisonGroup) {
      reply.tiles[key].comparisonGroup.value =  0;
      reply.tiles[key].comparisonGroup.hasValue =  false;
      reply.tiles[key].comparisonGroup.stateMessage =  "no-data";
    }else {
      reply.tiles[key].comparisonGroup.value = benchmarkComparisonGroup[key] ? benchmarkComparisonGroup[key] : 0;
      reply.tiles[key].comparisonGroup.hasValue = !!benchmarkComparisonGroup[key];
      if (!benchmarkComparisonGroup[key]){
        reply.tiles[key].comparisonGroup.stateMessage =  "no-data";
      }
    }
  });
    return reply;
}
const pay = async (establishmentId) => {
  const whereClause = {MainJobFkValue: 10,archived: false};
  const establishmentWorkersPay = await models.establishment.workers(establishmentId,whereClause,['AnnualHourlyPayRate']);
  let averagePaidAmount = 0;
  let stateMessage = '';
  if (establishmentWorkersPay) {
    let paidAmount = 0;
    await Promise.all(establishmentWorkersPay.workers.map(async worker => {
      paidAmount = paidAmount + Number(worker.AnnualHourlyPayRate);
      return paidAmount;
    }));
    averagePaidAmount = (paidAmount / establishmentWorkersPay.workers.length).toFixed(2);
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
}

module.exports = router;
module.exports.pay = pay;
module.exports.comparisonGroupData = comparisonGroupData;
