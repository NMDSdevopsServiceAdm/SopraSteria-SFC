const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');
const { hasPermission } = require('../../utils/security/hasPermission');

const getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer = async (req, res) => {
  const establishmentId = req.establishmentId;
  try {
    const workerCount = await models.worker.countAllWorkersWithoutDelegatedHealthCareActivities(establishmentId);

    res.status(200).send({
      noOfWorkersWhoRequiresAnswer: workerCount,
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

const getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer = async (req, res) => {
  const establishmentId = req.establishmentId;
  const itemsPerPage = parseIntWithDefault(req.query?.itemsPerPage, 15);
  const pageIndex = parseIntWithDefault(req.query?.pageIndex, 0);

  try {
    const { count, workers } = await models.worker.getAndCountAllWorkersWithoutDelegatedHealthCareActivities({
      establishmentId,
      itemsPerPage,
      pageIndex,
    });

    const responseBody = { workers, workerCount: count };
    return res.status(200).send(responseBody);
  } catch (err) {
    console.error('GET /WorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer - failed', err);
    return res.status(500).send('Failed to get workers for workplace with id: ' + establishmentId);
  }
};

router.route('/');
router
  .route('/NoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer')
  .get(hasPermission('canViewWorker'), getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer);

router
  .route('/WorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer')
  .get(hasPermission('canViewWorker'), getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer);

module.exports = router;
module.exports.getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer =
  getNoOfWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer;

module.exports.getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer =
  getWorkersWhoRequireCarriesOutDelegatedHealthCareActivitiesAnswer;
