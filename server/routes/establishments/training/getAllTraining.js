const express = require('express');
const router = express.Router({ mergeParams: true });

const Training = require('../../../models/classes/training').Training;
const MandatoryTraining = require('../../../models/classes/mandatoryTraining').MandatoryTraining;
const { formatTrainingRecords } = require('../../../utils/trainingRecordsUtils');
const { hasPermission } = require('../../../utils/security/hasPermission');

const getAllTraining = async (req, res) => {
  const mandatoryTrainingRecords = [];
  const nonMandatoryTrainingRecords = [];

  const establishmentId = req.establishmentId;
  const workerUid = req.params.workerId;

  try {
    const allTrainingRecords = await Training.fetch(establishmentId, workerUid);
    const mandatoryTrainingForWorker = await MandatoryTraining.fetchMandatoryTrainingForWorker(workerUid);

    const formattedTraining = formatTrainingRecords(allTrainingRecords, mandatoryTrainingForWorker);

    res.status(200);
    return res.json({
      ...formattedTraining,
      lastUpdated: allTrainingRecords.lastUpdated,
    });
  } catch (error) {
    console.error('Training::root getAllTraining - failed', error);
    res.status(500);
    return res.send(`Failed to get TrainingRecords for Worker having uid: ${escape(workerUid)}`);
  }
};

router.route('/').get(hasPermission('canEditWorker'), getAllTraining);

module.exports = router;
module.exports.getAllTraining = getAllTraining;
