const express = require('express');
const { Training } = require('../../../models/classes/training');
const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../../utils/security/hasPermission');

const getAllTrainingByStatus = async (req, res) => {
  const establishmentId = req.establishmentId;
  const status = req.params.status;

  try {
    if (!establishmentId || !status) {
      console.error('Training::root getAllTrainingByStatus - failed: establishment id or status not given');
      return res.status(400).send('The establishment id and status must be given');
    }

    const training = await Training.getAllEstablishmentTrainingByStatus(establishmentId, status);

    return res.status(200).json({ training });
  } catch (error) {
    console.error('Training::root getAllTrainingByStatus - failed', error);
    res.status(500).send(`Failed to get ${status} training and qualifications for establishment ${establishmentId}`);
  }
};

router.route('/').get(hasPermission('canViewWorker'), getAllTrainingByStatus);

module.exports = router;
module.exports.getAllTrainingByStatus = getAllTrainingByStatus;
