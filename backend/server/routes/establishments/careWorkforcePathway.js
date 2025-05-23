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

const parseIntWithDefault = (stringValue, defaultValue) => {
  const parsedValue = parseInt(stringValue);
  if (isNaN(parsedValue)) {
    return defaultValue;
  }
  return parsedValue;
};

const getWorkersWhoRequireCareWorkforcePathwayRoleAnswer = async (req, res) => {
  const establishmentId = req.establishmentId;
  const itemsPerPage = parseIntWithDefault(req.query?.itemsPerPage, 15);
  const pageIndex = parseIntWithDefault(req.query?.pageIndex, 0);

  try {
    const { count, workers } = await models.worker.getAndCountAllWorkersWithoutCareWorkforceCategory({
      establishmentId,
      itemsPerPage,
      pageIndex,
    });

    const responseBody = { workers, workerCount: count };
    return res.status(200).send(responseBody);
  } catch (err) {
    console.error('GET /workersWhoRequireCareWorkforcePathwayRoleAnswer - failed', err);
    return res.status(500).send('Failed to get workers for workplace with id: ' + establishmentId);
  }
};

router.route('/');
router
  .route('/noOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer')
  .get(hasPermission('canViewWorker'), getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer);

router
  .route('/workersWhoRequireCareWorkforcePathwayRoleAnswer')
  .get(hasPermission('canViewWorker'), getWorkersWhoRequireCareWorkforcePathwayRoleAnswer);

module.exports = router;
module.exports.getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer =
  getNoOfWorkersWhoRequireCareWorkforcePathwayRoleAnswer;
module.exports.getWorkersWhoRequireCareWorkforcePathwayRoleAnswer = getWorkersWhoRequireCareWorkforcePathwayRoleAnswer;
