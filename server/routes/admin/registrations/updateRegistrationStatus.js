const models = require('../../../models');

const updateRegistrationStatus = async (req, res) => {
  try {
    const { uid, status, reviewer, inReview } = req.body;
    const workplace = await models.establishment.findByUid(uid);

    if (!workplace) {
      return res.status(400).send({ error: 'Workplace could not be found' });
    }

    if (workplace.inReview && reviewer && workplace.reviewer !== reviewer) {
      return res.status(400).send({ error: 'This registration is already in progress' });
    }

    workplace.ustatus = status;
    workplace.reviewer = reviewer;
    workplace.inReview = inReview;
    await workplace.save();

    return res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

const router = require('express').Router();

router.route('/').post(updateRegistrationStatus);

module.exports = router;
module.exports.updateRegistrationStatus = updateRegistrationStatus;
