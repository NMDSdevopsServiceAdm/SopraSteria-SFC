const models = require('./../../../models');
const router = require('express').Router();

const getMissingRef = async (req, res) => {
  try {
    const establishmentCount = await models.establishment.getMissingEstablishmentRefCount(req.establishmentId);
    const workerCount = await models.establishment.getMissingWorkerRefCount(req.establishmentId);

    return res.status(200).json({
      establishment: establishmentCount,
      worker: workerCount,
    });
  } catch (err) {
    console.log(err);
    return res.status(503).send();
  }
};

router.route('/missing').get(getMissingRef);
module.exports = router;
module.exports.getMissingRef = getMissingRef;
