const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../../models');

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  try{
    const payData = await pay(req, res, establishmentId);
    const reply = {
      tiles: {
        pay: payData
      },
      meta: {

      }
    }
    return res.status(200).json(reply);
  }catch(err){
    console.error(err);
    return res.status(503).send();
  }
});

const pay = async (req, res, establishmentId) => {
  const whereClause = {MainJobFkValue: 10,archived: false}
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
      averagePay: {
        value: averagePaidAmount
      },
      comparisonGroup: {
        value: 0
      }
  };
  if (stateMessage.length) json.averagePay.stateMessage = stateMessage;
  return json;
}

module.exports = router;
