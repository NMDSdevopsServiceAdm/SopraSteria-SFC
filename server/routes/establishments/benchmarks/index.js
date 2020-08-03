const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../../models');

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  try{
    const payData = await pay(req, res, establishmentId);
    const reply = {
      pay: payData
    }
    return res.status(200).json(reply);
  }catch(err){
    console.error(err);
    return res.status(503).send();
  }
});

const pay = async (req, res, establishmentId) => {
  const establishmentWorkersPay = await models.establishment.workersPay(establishmentId);
  // const establishmentWorkersPay = await models.establishment.findOne({
  //   attributes: ['id'],
  //   include: {
  //     model: models.worker,
  //     attributes: ['id', 'uid', 'AnnualHourlyPayRate'],
  //     as: 'workers',
  //     where: {
  //       archived: false,
  //       MainJobFkValue: 10,
  //       AnnualHourlyPayValue: 'Hourly'
  //     }
  //   }, where: {
  //     archived: false,
  //     id: establishmentId
  //   }
  // });
  let averagePaidAmount = 0;
  if (establishmentWorkersPay) {
    let paidAmount = 0;
    await Promise.all(establishmentWorkersPay.workers.map(async worker => {
      paidAmount = paidAmount + Number(worker.AnnualHourlyPayRate);
      return paidAmount;
    }));
    averagePaidAmount = (paidAmount / establishmentWorkersPay.workers.length).toFixed(2);
  }
  return { averagePay: averagePaidAmount };
}

module.exports = router;
