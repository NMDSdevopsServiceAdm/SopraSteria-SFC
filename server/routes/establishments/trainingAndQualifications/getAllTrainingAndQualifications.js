const express = require('express');
const router = express.Router({ mergeParams: true });
const { getAllTraining } = require('../training/getAllTraining');
const { getAllQualifications } = require('../qualification/getAllQualification');
const { hasPermission } = require('../../../utils/security/hasPermission');


const getAllTrainingAndQualifications = async (req, res) => {
  const establishmentId = req.establishmentId;
  const workerUid = req.params.workerId;

  try {
    const formattedQualifications = await getAllQualifications(establishmentId, workerUid);
    const formattedTraining =  await getAllTraining(establishmentId, workerUid);

    res.status(200);
    return res.json({ ...formattedTraining, qualifications: formattedQualifications });
  } catch (error) {
    console.error('Training::root getAllTraining - failed', error);
    res.status(500);
    return res.send(`Failed to get TrainingRecords for Worker having uid: ${escape(workerUid)}`);
  }
}

router.route('/').get(hasPermission('canEditWorker'), getAllTrainingAndQualifications);

module.exports = router;
module.exports.getAllTrainingAndQualifications = getAllTrainingAndQualifications;

