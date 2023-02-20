const express = require('express');
const { Training } = require('../../../models/classes/training');

const models = require('../../../models/index');

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

    const { count: trainingCount, rows: training } = await Training.getAllEstablishmentTrainingByStatus(
      establishmentId,
      status,
      itemsPerPage && +itemsPerPage,
      pageIndex && +pageIndex,
      sortBy,
      searchTerm,
    );

    return res.status(200).json({ training, trainingCount });
  } catch (error) {
    console.error('Training::root getAllTrainingByStatus - failed', error);
    res.status(500).send(`Failed to get ${status} training and qualifications for establishment ${establishmentId}`);
  }
};

const getMissingMandatoryTraining = async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    if (!establishmentId) {
      console.error('Training::root getMissingMandatoryTraining - failed: establishment id not given');
      return res.status(400).send('The establishment id must be given');
    }

    const { count, rows } = await models.establishment.getWorkersWithMissingMandatoryTraining(establishmentId);

    const missingTraining = rows[0].workers;

    return res.status(200).json({ missingTraining, count });
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
