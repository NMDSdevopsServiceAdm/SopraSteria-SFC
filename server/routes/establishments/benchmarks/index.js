const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../../models');
const util = require("util");

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  let benchmarkComparisonGroup = await models.establishment.getBenchmarkData(establishmentId);
  benchmarkComparisonGroup =  benchmarkComparisonGroup.mainService ? benchmarkComparisonGroup.mainService.benchmarksData[0] : null;
  console.log(JSON.stringify(benchmarkComparisonGroup));
  try{
    const payData = await pay(req, res, establishmentId);

    let reply = {
      tiles: {
        pay: payData
      },
      meta: {

      }
    };

    reply = await comparisonGroupData(req,res,reply,benchmarkComparisonGroup);
    return res.status(200).json(reply);
  }catch(err){
    console.error(err);
    return res.status(503).send();
  }
});

const comparisonGroupData = async (req, res,reply,benchmarkComparisonGroup) => {
  Object.keys(reply.tiles).map(key => {
    if (!benchmarkComparisonGroup) {
      reply.tiles[key].comparisonGroup.value =  0;
      reply.tiles[key].comparisonGroup.hasValue =  false;
      reply.tiles[key].comparisonGroup.stateMessage =  "no-data";
    }else {
      reply.tiles[key].comparisonGroup.value = benchmarkComparisonGroup[key] ? benchmarkComparisonGroup[key] : 0;
      reply.tiles[key].comparisonGroup.hasValue = !!benchmarkComparisonGroup[key];
      reply.tiles[key].comparisonGroup.stateMessage = benchmarkComparisonGroup[key] ? "" : "no-data";
    }
  });
    return reply;
}
const pay = async (req, res, establishmentId) => {
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
