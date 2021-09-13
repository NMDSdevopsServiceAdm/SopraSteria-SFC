const models = require('../../../models');

const updateRegistrationStatus = async (req, res) => {
  try {
    const { uid, status } = req.body;
    const workplace = await models.establishment.findByUid(uid);

    if (!workplace) {
      return res.sendStatus(400);
    }

    workplace.status = status;
    workplace.save();

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

const router = require('express').Router();

router.route('/:establishmentUid').post(updateRegistrationStatus);

module.exports = router;
module.exports.updateRegistrationStatus = updateRegistrationStatus;
