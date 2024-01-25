const express = require('express');
const router = express.Router({ mergeParams: true });
const { getAllTraining } = require('../training/getAllTraining');
const { getAllQualifications } = require('../qualification/getAllQualification');
const { hasPermission } = require('../../../utils/security/hasPermission');

const getAllTrainingAndQualifications = async (req, res) => {
  const establishmentId = req.establishmentId;
  const workerUid = req.params.workerId;

  try {
    const formattedTraining = await getAllTraining(establishmentId, workerUid);
    const formattedQualifications = await getAllQualifications(establishmentId, workerUid);

    res.status(200);
    return res.json({ training: formattedTraining, qualifications: formattedQualifications });
  } catch (error) {
    console.error('Training::root getAllTrainingAndQualifications - failed', error);
    res.status(500);
    return res.send(`Failed to get training and qualification records for Worker with uid: ${escape(workerUid)}`);
  }
};

router.route('/').get(hasPermission('canViewWorker'), getAllTrainingAndQualifications);

module.exports = router;
module.exports.getAllTrainingAndQualifications = getAllTrainingAndQualifications;
