const router = require('express').Router();
const { hasPermission } = require('../../../utils/security/hasPermission');

const updateBUDataChanges = async (res) => {
  try {
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

router.route('/').post(hasPermission('canManageWdfClaims'), updateBUDataChanges);

module.exports = router;
module.exports.updateBUDataChanges = updateBUDataChanges;
