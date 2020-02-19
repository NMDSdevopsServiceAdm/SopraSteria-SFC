/**
 * Default route file for manage mandatory training
 */
const express = require('express');
const router = express.Router({mergeParams: true});

const MandatoryTraining = require('../../../models/classes/mandatoryTraining').MandatoryTraining;


/**
 * Handle GET request for getting all saved mandatory training
 */
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  try{
    const allMandatoryTrainingRecords = await MandatoryTraining.fetch(establishmentId);
    return res.status(200).json(allMandatoryTrainingRecords);
  }catch(err){
    console.error(err);
    return res.status(503).send();
  }
});

/**
 * Handle GET request for getting all saved mandatory training for view all mandatory training
 */
router.route('/all').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  try{
    const allMandatoryTrainingRecords = await MandatoryTraining.fetchAllMandatoryTrainings(establishmentId);
    return res.status(200).json(allMandatoryTrainingRecords);
  }catch(err){
    console.error(err);
    return res.status(503).send();
  }
});


/**
 * Handle POST request for creating new mandatory training
 */
router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;

  const thisMandatoryTrainingRecord = new MandatoryTraining(establishmentId);

  try{
    //validate posted records
    const isValidRecord = await thisMandatoryTrainingRecord.load(req.body);
    // records validated
    if (isValidRecord) {
      const saveRecords = await thisMandatoryTrainingRecord.save(req.userUid);

      return res.status(200).json(saveRecords);
    } else {
        return res.status(400).send('Unexpected Input.');
    }
  }catch(err){
    console.error(err);
    return res.status(503).send();
  }
});

module.exports = router;
