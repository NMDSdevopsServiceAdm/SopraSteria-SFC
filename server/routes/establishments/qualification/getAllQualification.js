const express = require('express');
const router = express.Router({ mergeParams: true });

const Qualification = require('../../../models/classes/qualification').Qualification;
const { sortQualificationsByGroup } = require('../../../utils/qualificationRecordsUtils');
const { hasPermission } = require('../../../utils/security/hasPermission');

const getAllQualification = async (req, res) => {
  const establishmentId = req.establishmentId;
  const workerUid = req.params.workerId;

  try {
    const allQualificationRecords = await Qualification.fetch(establishmentId, workerUid);
    const qualificationsSortedByGroup = sortQualificationsByGroup(
      allQualificationRecords.qualifications,
      allQualificationRecords.count,
    );
    return res.status(200).json(qualificationsSortedByGroup);
  } catch (err) {
    console.error('Qualification::root - failed', err);
    return res.status(500).send(`Failed to get Qualification Records for Worker having uid: ${escape(workerUid)}`);
  }
};

router.route('/').get(hasPermission('canEditWorker'), getAllQualification);

module.exports = router;
module.exports.getAllQualification = getAllQualification;
