const models = require('../../../models');

const updateRegistrationStatus = async (req, res) => {
  try {
    const { uid, status } = req.body;
    const workplace = await models.establishment.findByUid(uid);

    if (!workplace) {
      return res.status(400).send();
    }

    workplace.ustatus = status;
    await workplace.save();

    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
};

const router = require('express').Router();

router.route('/').post(updateRegistrationStatus);

module.exports = router;
module.exports.updateRegistrationStatus = updateRegistrationStatus;
