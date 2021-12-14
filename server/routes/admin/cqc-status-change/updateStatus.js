const models = require('../../../models');

const updateStatus = async (req, res) => {
  try {
    const { uid, status, reviewer, inReview } = req.body;
    const establishment = await models.establishment.findByUid(uid);

    if (!establishment) {
      return res.status(400).send({ error: 'Workplace could not be found' });
    }

    const approval = await models.Approvals.findbyEstablishmentId(establishment.id, 'CqcStatusChange', status);

    if (!approval) {
      return res.status(400).send({ error: 'CQC status change request could not be found' });
    }

    if (approval.InReview && reviewer && approval.Reviewer !== reviewer) {
      return res.status(400).send({ error: 'This CQC status change request is already being reviewed' });
    }

    approval.Status = status;
    approval.Reviewer = reviewer;
    approval.InReview = inReview;
    await approval.save();

    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const router = require('express').Router();

router.route('/').post(updateStatus);

module.exports = router;
module.exports.updateStatus = updateStatus;
