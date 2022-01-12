const models = require('../../../models');

const updateBUDataChanges = async (req, res) => {
  try {
    const { uid } = req.establishment;
    const { lastUpdated } = req.body;
    const establishment = await models.establishment.findByUid(uid);

    if (!establishment) {
      return res.status(400).send({ error: 'Workplace could not be found' });
    }
    const updateLastUpdatdDate = await models.establishment.updateDataChangesLastUpdatedDate(
      establishment.id,
      lastUpdated,
    );

    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
};

const router = require('express').Router();

router.route('/').post(updateBUDataChanges);

module.exports = router;
module.exports.updateBUDataChanges = updateBUDataChanges;
