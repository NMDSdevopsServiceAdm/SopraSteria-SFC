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

const createAndUpdateMandatoryTraining = async (req, res) => {
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

const deleteMandatoryTrainingById = async (req, res) => {
  const thisTrainingRecord = new MandatoryTraining(req.establishmentId);
  try {
    await thisTrainingRecord.deleteMandatoryTrainingById(req.params.categoryId);
    res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json();
  }
};

const deleteAllMandatoryTraining = async (req, res) => {
  const thisTrainingRecord = new MandatoryTraining(req.establishmentId);
  try {
    await thisTrainingRecord.deleteAllMandatoryTraining();

    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

router.route('/').get(hasPermission('canViewWorker'), viewMandatoryTraining);
router.route('/').post(hasPermission('canAddWorker'), createAndUpdateMandatoryTraining);

// TODO - we can potentially remove this endpoint
// There is a ViewAllMandatoryTrainingComponent on the FE but this may also not be used
// as we have the same view when filtering Training & Quals by category.
router.route('/all').get(hasPermission('canViewWorker'), viewAllMandatoryTraining);
router.route('/').delete(hasPermission('canEditWorker'), deleteAllMandatoryTraining);
router.route('/:categoryId').delete(deleteMandatoryTrainingById);

module.exports = router;
module.exports.createAndUpdateMandatoryTraining = createAndUpdateMandatoryTraining;
module.exports.deleteMandatoryTrainingById = deleteMandatoryTrainingById;
