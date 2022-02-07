const router = require('express').Router();
const models = require('../../../models');

const updateBUDataChanges = async (res) => {
  try {
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

router.route('/').post(updateBUDataChanges);

module.exports = router;
module.exports.updateBUDataChanges = updateBUDataChanges;
