const router = require('express').Router();
const models = require('../../../models');

const getDataChangesLastUpdated = async (req, res) => {
  try {
    const dataChangesLastUpdated = await models.establishment.getdataChangesLastUpdated(req.establishment.id);

    const dataChangesLastUpdate = dataChangesLastUpdated.get('DataChangesLastUpdated');

    res.status(200);
    return res.json({
      dataChangesLastUpdate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const updateBUDataChanges = async (req, res) => {
  try {
    const { lastUpdated } = req.body;
    await models.establishment.updateDataChangesLastUpdatedDate(req.establishment.id, lastUpdated);

    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};
router.route('/').get(getDataChangesLastUpdated);
router.route('/').post(updateBUDataChanges);

module.exports = router;
module.exports.getDataChangesLastUpdated = getDataChangesLastUpdated;
module.exports.updateBUDataChanges = updateBUDataChanges;
