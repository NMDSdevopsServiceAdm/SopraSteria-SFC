const express = require('express');
const { Training } = require('../../../models/classes/training');

const models = require('../../../models/index');
const { transformWorkersWithMissingMandatoryTraining } = require('../../../transformers/trainingCategoryTransformer');

const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../../utils/security/hasPermission');

const getAllTrainingByStatus = async (req, res) => {
  const establishmentId = req.establishmentId;
  const status = req.params.status;
  const { itemsPerPage, pageIndex, sortBy, searchTerm } = req.query;

  try {
    if (!establishmentId || !status) {
      console.error('Training::root getAllTrainingByStatus - failed: establishment id or status not given');
      return res.status(400).send('The establishment id and status must be given');
    }

    const { count: workerCount, rows } = await models.establishment.getWorkerWithExpiredExpiringOrMissingTraining(
      establishmentId,
      status,
      itemsPerPage && +itemsPerPage,
      pageIndex && +pageIndex,
      sortBy,
      searchTerm,
    );

    if (rows.length === 0) {
      return res.status(200).json({ workers: [], workerCount: 0 });
    }

    const workerIds = rows[0].workers.map((worker) => worker.id);

    const workers = await Training.getWorkersTrainingByStatus(establishmentId, workerIds, status);

    return res.status(200).json({ workers, workerCount });
  } catch (error) {
    console.error('Training::root getAllTrainingByStatus - failed', error);
    res.status(500).send(`Failed to get ${status} training and qualifications for establishment ${establishmentId}`);
  }
};

const getMissingMandatoryTraining = async (req, res) => {
  const establishmentId = req.establishmentId;
  const { itemsPerPage, pageIndex, sortBy, searchTerm } = req.query;
  const status = 'missing';

  try {
    if (!establishmentId) {
      console.error('Training::root getMissingMandatoryTraining - failed: establishment id not given');
      return res.status(400).send('The establishment id must be given');
    }

    const { count: workerCount, rows } = await models.establishment.getWorkerWithExpiredExpiringOrMissingTraining(
      establishmentId,
      status,
      itemsPerPage && +itemsPerPage,
      pageIndex && +pageIndex,
      sortBy,
      searchTerm,
    );

    if (rows.length === 0) {
      return res.status(200).json({ workers: [], workerCount: 0 });
    }

    const workerIds = rows[0].workers.map((worker) => worker.id);

    const workers = await Training.getWorkersMissingTraining(establishmentId, workerIds);

    const transformedWorkers = transformWorkersWithMissingMandatoryTraining(workers);

    return res.status(200).json({ workers: transformedWorkers, workerCount, rows: rows[0].workers });
  } catch (err) {
    console.error('Training::root getMissingMandatoryTraining - failed', err);
    res.status(500).send(`Failed to get missing training for establishment ${establishmentId}`);
  }
};
router.route('/missing-training').get(hasPermission('canViewWorker'), getMissingMandatoryTraining);

router.route('/:status').get(hasPermission('canViewWorker'), getAllTrainingByStatus);

module.exports = router;
module.exports.getAllTrainingByStatus = getAllTrainingByStatus;
module.exports.getMissingMandatoryTraining = getMissingMandatoryTraining;
