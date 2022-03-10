// default route for Workers' training endpoint
const express = require('express');
const router = express.Router({ mergeParams: true });

const { hasPermission } = require('../../../../utils/security/hasPermission');
const { createSingleTrainingRecord } = require('../index');

const createMultipleTrainingRecords = async (req, res) => {
  const establishmentId = req.establishmentId;
  const workerUids = req.body.workerUids;

  try {
    await Promise.all(
      workerUids.map(async (workerUid) => {
        await createSingleTrainingRecord(req, res, establishmentId, workerUid, req.body.trainingRecord);
      }),
    );
    return res.status(200).send({ savedRecords: workerUids.length });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
};

router.route('/').post(hasPermission('canEditWorker'), createMultipleTrainingRecords);

module.exports = router;
module.exports.createMultipleTrainingRecords = createMultipleTrainingRecords;
