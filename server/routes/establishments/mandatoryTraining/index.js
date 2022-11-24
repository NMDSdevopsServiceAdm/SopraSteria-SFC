/**
 * Default route file for manage mandatory training
 */
const express = require('express');
const router = express.Router({ mergeParams: true });

const MandatoryTraining = require('../../../models/classes/mandatoryTraining').MandatoryTraining;

const { hasPermission } = require('../../../utils/security/hasPermission');

/**
 * Handle GET request for getting all saved mandatory training
 */

const viewMandatoryTraining = async (req, res) => {
  const establishmentId = req.establishmentId;
  try {
    const allMandatoryTrainingRecords = await MandatoryTraining.fetch(establishmentId);
    return res.status(200).json(allMandatoryTrainingRecords);
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

/**
 * Handle GET request for getting all saved mandatory training for view all mandatory training
 */
const viewAllMandatoryTraining = async (req, res) => {
  const establishmentId = req.establishmentId;
  try {
    const allMandatoryTrainingRecords = await MandatoryTraining.fetchAllMandatoryTrainings(establishmentId);
    return res.status(200).json(allMandatoryTrainingRecords);
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

/**
 * Handle POST request for creating new mandatory training
 */

const createMandatoryTraining = async (req, res) => {
  const thisMandatoryTrainingRecord = new MandatoryTraining(req.establishmentId);
  try {
    const isValidRecord = await thisMandatoryTrainingRecord.load(req.body);
    if (isValidRecord) {
      const saveStatus = await thisMandatoryTrainingRecord.save(req.userUid);
      return res.status(200).json(`success: ${saveStatus}`);
    } else {
      return res.status(400).send('Unexpected Input.');
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
};

router.route('/').get(hasPermission('canAddWorker'), viewMandatoryTraining);
router.route('/').post(hasPermission('canAddWorker'), createMandatoryTraining);

// TODO - we can potentially remove this endpoint
// There is a ViewAllMandatoryTrainingComponent on the FE but this may also not be used
// as we have the same view when filtering Training & Quals by category.
router.route('/all').get(hasPermission('canAddWorker'), viewAllMandatoryTraining);

module.exports = router;
