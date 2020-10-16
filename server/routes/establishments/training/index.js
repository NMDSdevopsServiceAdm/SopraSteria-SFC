// default route for Workers' training endpoint
const express = require('express');
const router = express.Router({ mergeParams: true });

// all user functionality is encapsulated
const Training = require('../../../models/classes/training').Training;
const MandatoryTraining = require('../../../models/classes/mandatoryTraining').MandatoryTraining;

// NOTE - the Worker route uses middleware to validate the given worker id against the known establishment
//        prior to all training endpoints, thus ensuring we this necessary rigidity on Establishment/Worker relationship
//        for training records.

// returns a list of all training records for the given worker UID
// Inherits the security middleware declared in the Worker route for training.
// Inheirts the "workerUid" parameter declared in the Worker route for training.
router.route('/').get(async (req, res) => {
  await getTrainingListWithMissingMandatoryTraining(req, res);
});

// gets requested training record using the training uid
router.route('/:trainingUid').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  const trainingUid = req.params.trainingUid;
  const workerUid = req.params.workerId;

  const thisTrainingRecord = new Training(establishmentId, workerUid);

  try {
    if (await thisTrainingRecord.restore(trainingUid)) {
      return res.status(200).json(thisTrainingRecord.toJSON());
    } else {
      // not found training record
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

// creates given training record for the 'given' worker by UID
router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const workerUid = req.params.workerId;

  const thisTrainingRecord = new Training(establishmentId, workerUid);

  try {
    // by loading after the restore, only those properties defined in the
    //  PUT body will be updated (peristed)
    const isValidRecord = await thisTrainingRecord.load(req.body);

    // this is an update to an existing User, so no mandatory properties!
    if (isValidRecord) {
      await thisTrainingRecord.save(req.username);

      return res.status(200).json(thisTrainingRecord.toJSON());
    } else {
      return res.status(400).send('Unexpected Input.');
    }
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

// updates requested training record using the training uid
router.route('/:trainingUid').put(async (req, res) => {
  const establishmentId = req.establishmentId;
  const trainingUid = req.params.trainingUid;
  const workerUid = req.params.workerId;

  const thisTrainingRecord = new Training(establishmentId, workerUid);

  try {
    // before updating a Worker, we need to be sure the Worker is
    //  available to the given establishment. The best way of doing that
    //  is to restore from given UID
    if (await thisTrainingRecord.restore(trainingUid)) {
      // TODO: JSON validation

      // by loading after the restore, only those properties defined in the
      //  PUT body will be updated (peristed)
      const isValidRecord = await thisTrainingRecord.load(req.body);

      // this is an update to an existing User, so no mandatory properties!
      if (isValidRecord) {
        await thisTrainingRecord.save(req.username);

        return res.status(200).json(thisTrainingRecord.toJSON());
      } else {
        return res.status(400).send('Unexpected Input.');
      }
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

// deletes requested training record using the training uid
router.route('/:trainingUid').delete(async (req, res) => {
  const establishmentId = req.establishmentId;
  const trainingUid = req.params.trainingUid;
  const workerUid = req.params.workerId;

  const thisTrainingRecord = new Training(establishmentId, workerUid);

  try {
    // before updating a Worker, we need to be sure the Worker is
    //  available to the given establishment. The best way of doing that
    //  is to restore from given UID
    if (await thisTrainingRecord.restore(trainingUid)) {
      // TODO: JSON validation

      // by deleting after the restore we can be sure this training record belongs to the given worker
      const deleteSuccess = await thisTrainingRecord.delete();

      if (deleteSuccess) {
        return res.status(204).json();
      } else {
        return res.status(404).json('Not Found');
      }
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

const getTrainingListWithMissingMandatoryTraining = async (req, res) => {
  const establishmentId = req.establishmentId;
  const workerUid = req.params.workerId;
  let missingMandatoryTraining = [];
  try {
    let allTrainingRecords = await Training.fetch(establishmentId, workerUid);
    const mandatoryTrainingforWorker = await MandatoryTraining.fetchMandatoryTrainingForWorker(workerUid);
    if (allTrainingRecords.count === 0) {
      missingMandatoryTraining = mandatoryTrainingforWorker;
    } else if (mandatoryTrainingforWorker.length > 0) {
      mandatoryTrainingforWorker.forEach((mandatoryTraining) => {
        mantrainingDone = false;
        allTrainingRecords.training.forEach((training) => {
          if (mandatoryTraining.trainingCategoryFK === training.trainingCategory.id) {
            mantrainingDone = true;
          }
        });
        if (mantrainingDone === false) {
          missingMandatoryTraining.push(mandatoryTraining);
        }
      });
    }
    missingMandatoryTraining.forEach((thisRecord) => {
      allTrainingRecords.training.unshift({
        uid: thisRecord.id,
        trainingCategory: {
          id: thisRecord.workerTrainingCategories.id,
          category: thisRecord.workerTrainingCategories.category,
        },
        title: undefined,
        missing: true,
        accredited: undefined,
        completed: undefined,
        expires: undefined,
        notes: undefined,
        created: thisRecord.created.toISOString(),
        updated: thisRecord.updated.toISOString(),
        updatedBy: thisRecord.updatedBy,
      });
    });
    res.status(200);
    return res.json(allTrainingRecords);
  } catch (err) {
    console.error('Training::root - failed', err);
    res.status(503);
    return res.send(`Failed to get Training Records for Worker having uid: ${escape(workerUid)}`);
  }
};
module.exports = router;
module.exports.getTrainingListWithMissingMandatoryTraining = getTrainingListWithMissingMandatoryTraining;
