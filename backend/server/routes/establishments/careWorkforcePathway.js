const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');
const { hasPermission } = require('../../utils/security/hasPermission');

const getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer = async (req, res) => {
  const establishmentId = req.establishmentId;
  try {
    let workers = await models.worker.getAllWorkersWithoutCareWorkforceCategory(establishmentId);

    res.status(200).send({
      noOfWorkersWhoRequireAnswers: workers.length,
    });
  } catch (err) {
    console.error('worker::GET:total - failed', err);
    return res.status(500).send('Failed to get total workers for workplace with id: ' + establishmentId);
  }
};

router.route('/');
router
  .route('/noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer')
  .get(hasPermission('canViewWorker'), getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer);

module.exports = router;
module.exports.getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer =
  getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer;
