// default route for Workers' training endpoint
const express = require('express');
const router = express.Router({ mergeParams: true });

// all user functionality is encapsulated
const Training = require('../../../models/classes/training').Training;
const MandatoryTraining = require('../../../models/classes/mandatoryTraining').MandatoryTraining;

const { hasPermission } = require('../../../utils/security/hasPermission');

const getTrainingCategories = (trainingRecords) => {
 return trainingRecords.reduce(
    (accumulator, current) => {
      if(!accumulator.some(training => training.id === current.trainingCategory.id)) {
        accumulator.push(current.trainingCategory)
      }
      return accumulator;
    }, []
  );
};


const getAllTraining = async (req, res) => {

  const mandatoryTrainingRecords = [];
  const nonMandatoryTrainingRecords = [];

  const establishmentId = req.establishmentId;
  const workerUid = req.params.workerId;

  try {
    const allTrainingRecords = await Training.fetch(establishmentId, workerUid);
    const mandatoryTrainingForWorker = await MandatoryTraining.fetchMandatoryTrainingForWorker(workerUid);

    allTrainingRecords.training.forEach((training) => {
      if (mandatoryTrainingForWorker.length === 0) {
        nonMandatoryTrainingRecords.push(training);
      } else {
        // This doesn't work. Will be done in mandatory training ticket
        mandatoryTrainingForWorker.forEach((mandatoryTraining) => {
         if (mandatoryTraining.trainingCategoryFK === training.trainingCategory.id) {
           mandatoryTrainingRecords.push(training);
         } else {
           nonMandatoryTrainingRecords.push(training);
         }
       });
      }
    });

    const nonMandatoryUniqCategories = getTrainingCategories(nonMandatoryTrainingRecords);

    const nonMandatoryCategories = nonMandatoryUniqCategories.map(category =>{
      return {
        category: category.category,
        id: category.id,
        trainingRecords: []
      }
    });

    nonMandatoryCategories.forEach(category => {
      category.trainingRecords = nonMandatoryTrainingRecords.filter(trainingRecord => trainingRecord.trainingCategory.id === category.id);
    });

    const formattedTrainingRecords = {
      mandatory: mandatoryTrainingRecords,
      nonMandatory: nonMandatoryCategories
    };

    res.status(200);
    return res.json(formattedTrainingRecords);
  } catch (error) {
    console.error('Training::root getAllTraining - failed', error);
    res.status(500);
    return res.send(`Failed to get TrainingRecords for Worker having uid: ${escape(workerUid)}`);
  }
}

router.route('/').get(hasPermission('canEditWorker'), getAllTraining);

module.exports = router;
module.exports.getAllTraining = getAllTraining;
module.exports.getTrainingCategories = getTrainingCategories;
