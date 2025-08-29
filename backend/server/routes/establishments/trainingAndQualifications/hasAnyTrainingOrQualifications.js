const express = require('express');
const router = express.Router({ mergeParams: true });
const Qualification = require('../../../models/classes/qualification').Qualification;
const Training = require('../../../models/classes/training').Training;
const { hasPermission } = require('../../../utils/security/hasPermission');

const hasAnyTrainingOrQualifications = async (req, res) => {
  const establishmentId = req.establishmentId;
  const workerUid = req.params.workerId;

  try {
    const allTrainingRecords = await Training.fetch(establishmentId, workerUid);
    const allQualificationRecords = await Qualification.fetch(establishmentId, workerUid);

    let hasAnyTrainingOrQualifications = false;

    if (allTrainingRecords?.count > 0 || allQualificationRecords?.count > 0) {
      hasAnyTrainingOrQualifications = true;
    }

    res.status(200);
    return res.json({ hasAnyTrainingOrQualifications });
  } catch (error) {
    console.error('Training::root hasAnyTrainingOrQualifications - failed', error);
    res.status(500);
    return res.send(`Failed to get hasAnyTrainingOrQualifications`);
  }
};

router.route('/').get(hasPermission('canViewWorker'), hasAnyTrainingOrQualifications);

module.exports = router;
module.exports.hasAnyTrainingOrQualifications = hasAnyTrainingOrQualifications;
