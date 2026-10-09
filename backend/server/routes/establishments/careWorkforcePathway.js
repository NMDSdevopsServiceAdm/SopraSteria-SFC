const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');
const { hasPermission } = require('../../utils/security/hasPermission');
const { updateCareWorkforcePathwayUse } = require('./careWorkforcePathway/careWorkforcePathwayUse');
const { updateCareWorkforcePathwayAwareness } = require('./careWorkforcePathway/careWorkforcePathwayAwareness');
const { WorkerSortByOptions } = require('../../data/sortByOptions');

const countWorkersWhoRequireCareWorkforcePathwayRoleAnswer = async (req, res) => {
  const establishmentId = req.establishmentId;
  try {
    const workerCount = await models.worker.countAllWorkersForCareWorkforcePathwayRoleCategory(establishmentId);

    res.status(200).send({
      noOfWorkersWhoRequireAnswers: workerCount,
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

  const allowedSortByOptions = WorkerSortByOptions;
  const sortBy = allowedSortByOptions.includes(req.query?.sortBy) ? req.query?.sortBy : 'staffNameAsc';

  try {
    const { count, workers } = await models.worker.getAndCountAllWorkersForCareWorkforcePathwayRoleCategory({
      establishmentId,
      itemsPerPage,
      pageIndex,
      sortBy,
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
  .get(hasPermission('canViewWorker'), countWorkersWhoRequireCareWorkforcePathwayRoleAnswer);

router
  .route('/workersWhoRequireCareWorkforcePathwayRoleAnswer')
  .get(hasPermission('canViewWorker'), getWorkersWhoRequireCareWorkforcePathwayRoleAnswer);

router.route('/careWorkforcePathwayUse').post(hasPermission('canEditEstablishment'), updateCareWorkforcePathwayUse);
router
  .route('/careWorkforcePathwayAwareness')
  .post(hasPermission('canEditEstablishment'), updateCareWorkforcePathwayAwareness);

module.exports = router;

module.exports.countWorkersWhoRequireCareWorkforcePathwayRoleAnswer =
  countWorkersWhoRequireCareWorkforcePathwayRoleAnswer;
module.exports.getWorkersWhoRequireCareWorkforcePathwayRoleAnswer = getWorkersWhoRequireCareWorkforcePathwayRoleAnswer;
