const models = require('./../../../models');
const router = require('express').Router();

const getMissingRef = async (req, res) => {

  const establishmentCount = await models.establishment.getMissingEstablishmentRefCount(req.establishmentId);
  const workerCount = await models.establishment.getMissingWorkerRefCount(req.establishmentId);

  return {
    establishment: establishmentCount,
    worker: workerCount
  };

};


router.route('/missing').get(getMissingRef);
module.exports = router;
module.exports.getMissingRef = getMissingRef;
