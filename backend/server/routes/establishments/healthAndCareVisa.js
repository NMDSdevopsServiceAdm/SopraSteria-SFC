const express = require('express');
const router = express.Router();
const models = require('../../models');

const getWorkplaceWorkersWithHealthAndCareVisa = async function (req, res) {
  try {
    const workers = await models.worker.getWorkersWithHealthAndCareVisaForWorkplace(req.establishmentId);

    return res.status(200).json({ workersWithHealthAndCareVisas: formatWorkers(workers) });
  } catch (err) {
    return res.status(500).send();
  }
};

const formatWorkers = (workers) => {
  return workers.map((worker) => {
    return { id: worker.id, uid: worker.uid, nameOrId: worker.NameOrIdValue };
  });
};

router.route('/').get(getWorkplaceWorkersWithHealthAndCareVisa);

module.exports = router;
module.exports.getWorkplaceWorkersWithHealthAndCareVisa = getWorkplaceWorkersWithHealthAndCareVisa;
