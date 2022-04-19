// worker extends from Establishment, because workers can only belong to an establishment
// by extending workers API from Establishment API endpoint, it leverages the existing
// route middleware for authenticating establishment id.

const express = require('express');
const router = express.Router({ mergeParams: true });
const Establishment = require('../../models/classes/establishment');

const moment = require('moment');
const get = require('lodash/get');

// all worker functionality is encapsulated
const Workers = require('../../models/classes/worker');
const models = require('../../models');
const WdfCalculator = require('../../models/classes/wdfCalculator').WdfCalculator;

// parent route defines the "id" parameter

// child routes
const TrainingRoutes = require('./training');
const QualificationRoutes = require('./qualification');
const MandatoryTrainingRoutes = require('./mandatoryTraining');
const MutipleTrainingRecordsRoute = require('./training/multiple');
const TrainingAndQualificationsRoutes = require('./trainingAndQualifications');

const { hasPermission } = require('../../utils/security/hasPermission');

const viewWorker = async (req, res) => {
  const workerId = req.params.workerId;
  const establishmentId = req.establishmentId;
  const showHistory =
    req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

  // validating worker id - must be a V4 UUID
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  if (!uuidRegex.test(workerId.toUpperCase())) return res.status(400).send('Unexpected worker id');

  const thisWorker = new Workers.Worker(establishmentId);

  try {
    if (await thisWorker.restore(workerId, showHistory && req.query.history !== 'property')) {
      const jsonResponse = thisWorker.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false, false, null);

      if (req.query.wdf) jsonResponse.wdf = await thisWorker.wdfToJson();

      return res.status(200).json(jsonResponse);
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    const thisError = new Workers.WorkerExceptions.WorkerRestoreException(
      null,
      thisWorker.uid,
      null,
      err,
      null,
      `Failed to retrieve worker with uid: ${workerId}`,
    );

    console.error('worker::GET/:workerId - failed', thisError.message);
    return res.status(500).send(thisError.safe);
  }
};

// creates new worker
const createWorker = async (req, res) => {
  const establishmentId = req.establishmentId;
  const newWorker = new Workers.Worker(establishmentId);

  try {
    // TODO: JSON validation
    const isValidWorker = await newWorker.load(req.body);

    // specific to a Worker creation, there are three mandatory properties
    //  confirm all mandatory properties are present
    if (!newWorker.hasMandatoryProperties) {
      return res.status(400).send('Not all mandatory properties have been provided');
    }

    if (isValidWorker) {
      // note - req.username is assured, vecause it is provided through the
      //  hasAuthorisedEstablishment middleware which runs on all establishment routes
      await newWorker.save(req.username);
      return res.status(201).json(newWorker.toJSON(false, false, false, false));
    } else {
      return res.status(400).send('Unexpected Input.');
    }
  } catch (err) {
    if (err instanceof Workers.WorkerExceptions.WorkerJsonException) {
      console.error('Worker POST: ', err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Workers.WorkerExceptions.WorkerSaveException) {
      console.error('Worker POST: ', err.message);
      return res.status(500).send(err.safe);
    }
    console.error('Worker POST: unexpected exception: ', err);
    return res.status(500).send();
  }
};

const editWorker = async (req, res) => {
  const workerId = req.params.workerId;
  const establishmentId = req.establishmentId;

  // validating worker id - must be a V4 UUID
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  if (!uuidRegex.test(workerId.toUpperCase())) {
    res.status(400);
    return res.send('Unexpected worker id');
  }

  const thisWorker = new Workers.Worker(establishmentId);

  try {
    // before updating a Worker, we need to be sure the Worker is
    //  available to the given establishment. The best way of doing that
    //  is to restore from given UID
    if (await thisWorker.restore(workerId)) {
      // TODO: JSON validation
      if (req.body.establishmentId) {
        thisWorker.establishmentId = req.body.establishmentId;
        thisWorker.establishmentFk = req.body.establishmentId;
        req.body.establishmentFk = req.body.establishmentId;
      }

      // by loading after the restore, only those properties defined in the
      //  PUT body will be updated (peristed)
      const isValidWorker = await thisWorker.load(req.body);
      // this is an update to an existing Worker, so no mandatory properties!
      if (isValidWorker) {
        await thisWorker.save(req.username);

        const exceptionalOverrideHeader = req.headers['x-override-put-return-all'];
        const showModifiedOnly = exceptionalOverrideHeader ? false : true;
        res.status(200);
        return res.json(thisWorker.toJSON(false, false, false, showModifiedOnly));
      } else {
        res.status(400);
        return res.send('Unexpected Input.');
      }
    } else {
      // not found worker
      res.status(404);
      return res.send('Not Found');
    }
  } catch (err) {
    if (err instanceof Workers.WorkerExceptions.WorkerSaveException && err.message == 'Duplicate LocalIdentifier') {
      console.error('Worker::localidentifier PUT: ', err.message);
      res.status(400);
      return res.send(err.safe);
    } else if (err instanceof Workers.WorkerExceptions.WorkerJsonException) {
      console.error('Worker PUT: ', err.message);
      res.status(400);
      return res.send(err.safe);
    } else if (err instanceof Workers.WorkerExceptions.WorkerSaveException) {
      console.error('Worker PUT: ', err.message);
      res.status(500);
      return res.send(err.safe);
    }

    res.status(500);
    return res.send(err);
  }
};

// deletes given worker id
const deleteWorker = async (req, res) => {
  const workerId = req.params.workerId;
  const establishmentId = req.establishmentId;

  // when deleting a worker, an optional reason can be given
  // that will be given in the body of the DELETE
  const reason = req.body.reason;

  // validating worker id - must be a V4 UUID
  const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
  if (!uuidRegex.test(workerId.toUpperCase())) return res.status(400).send('Unexpected worker id');

  const thisWorker = new Workers.Worker(establishmentId);

  try {
    // before deleting a Worker, we need to be sure the Worker is
    //  available to the given establishment. The best way of doing that
    //  is to restore from given UID
    if (await thisWorker.restore(workerId)) {
      // by loading after the restore, only those properties defined in the
      //  PUT body will be updated (peristed)
      const isValidWorker = await thisWorker.load({
        reason,
      });

      // this is an update to an existing Worker, so no mandatory properties!
      if (isValidWorker) {
        // now "delete" this Worker by archiving it
        await thisWorker.archive(req.username);
        return res.status(204).send();
      } else {
        return res.status(400).send('Unexpected Input.');
      }
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    if (err instanceof Workers.WorkerExceptions.WorkerDeleteException) {
      console.error('Worker DELETE: ', err.message);
      return res.status(500).send(err.safe);
    } else {
      console.error('Worker DELETE - unexpected exception: ', err);
      return res.status(500).send();
    }
  }
};

const getTotalWorkers = async (req, res) => {
  const establishmentId = req.establishmentId;

  const where = {
    archived: false,
  };

  try {
    const allWorkers = await models.establishment.workers(establishmentId, where, []);

    return res.status(200).json({
      total: get(allWorkers, 'workers') ? allWorkers.workers.length : 0,
    });
  } catch (err) {
    console.error('worker::GET:total - failed', err);
    return res.status(500).send('Failed to get total workers for establishment having id: ' + establishmentId);
  }
};

const viewAllWorkers = async (req, res) => {
  const establishmentId = req.establishmentId;
  const effectiveFromIso = WdfCalculator.effectiveDate.toISOString();
  const { itemsPerPage, pageIndex, sortBy, searchTerm } = req.query;

  try {
    const establishmentWorkersAndTraining = await models.establishment.workersAndTraining(
      establishmentId,
      false,
      false,
      itemsPerPage ? +itemsPerPage : undefined,
      pageIndex ? +pageIndex : undefined,
      sortBy,
      searchTerm,
    );
    const rows = establishmentWorkersAndTraining.rows;
    const foundWorkers = rows.length && rows[0].workers;
    const workerCount = establishmentWorkersAndTraining.count;

    res.status(200).send({
      workers: foundWorkers
        ? foundWorkers.map((worker) => {
            return {
              uid: worker.uid,
              localIdentifier: worker.LocalIdentifierValue ? worker.LocalIdentifierValue : null,
              nameOrId: worker.NameOrIdValue,
              contract: worker.ContractValue,
              mainJob: {
                jobId: worker.mainJob.id,
                title: worker.mainJob.title,
                jobRoleName: worker.mainJob.get('jobRoleName'),
                other: worker.MainJobFkOther ? worker.MainJobFkOther : undefined,
              },
              completed: worker.CompletedValue,
              created: worker.created,
              updated: worker.updated,
              updatedBy: worker.updatedBy,
              effectiveFrom: effectiveFromIso,
              wdfEligible: worker.wdfEligible && moment(worker.lastWdfEligibility).isAfter(effectiveFromIso),
              wdfEligibilityLastUpdated: worker.lastWdfEligibility
                ? worker.lastWdfEligibility.toISOString()
                : undefined,
              trainingCount: parseInt(worker.get('trainingCount')),
              qualificationCount: parseInt(worker.get('qualificationCount')),
              expiredTrainingCount: parseInt(worker.get('expiredTrainingCount')),
              expiringTrainingCount: parseInt(worker.get('expiringTrainingCount')),
              missingMandatoryTrainingCount: parseInt(worker.get('missingMandatoryTrainingCount')),
              longTermAbsence: worker.LongTermAbsence,
            };
          })
        : [],
      workerCount,
    });
  } catch (err) {
    console.error('worker::GET:all - failed', err);
    return res.status(500).send('Failed to get workers for establishment having id: ' + establishmentId);
  }
};

const updateLocalIdentifiers = async (req, res) => {
  const establishmentId = req.establishmentId;
  const username = req.username;

  // validate input
  const givenLocalIdentifiers = req.body.localIdentifiers;
  if (!givenLocalIdentifiers || !Array.isArray(givenLocalIdentifiers)) {
    return res.status(400).send({});
  }

  const thisEstablishment = new Establishment.Establishment(username);

  try {
    // as a minimum for security purposes, we restore the user's primary establishment
    if (await thisEstablishment.restore(establishmentId)) {
      const updatedUids = await Workers.Worker.bulkUpdateLocalIdentifiers(
        username,
        establishmentId,
        givenLocalIdentifiers,
      );

      const updatedTimestamp = new Date();
      return res.status(200).json({
        id: thisEstablishment.id,
        uid: thisEstablishment.uid,
        name: thisEstablishment.name,
        updated: updatedTimestamp.toISOString(),
        updatedBy: req.username,
        localIdentifiers: updatedUids,
      });
    } else {
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    if (err.name && err.name === 'SequelizeUniqueConstraintError') {
      if (err.parent.constraint && err.parent.constraint === 'worker_LocalIdentifier_unq') {
        console.error('Worker::localidentifier PUT: ', err.message);
        return res.status(400).send({ duplicateValue: err.fields.LocalIdentifierValue });
      }
    }
    console.error(err);
    return res.status(500).send(err.message);
  }
};

router.route('/').get(hasPermission('canViewWorker'), viewAllWorkers);
router.route('/').post(hasPermission('canAddWorker'), createWorker);

router.route('/localIdentifier').put(hasPermission('canBulkUpload'), updateLocalIdentifiers);
router.route('/total').get(hasPermission('canViewEstablishment'), getTotalWorkers);

router.use('/multiple-training', MutipleTrainingRecordsRoute);

router.route('/:workerId').get(hasPermission('canViewWorker'), viewWorker);
router.route('/:workerId').put(hasPermission('canEditWorker'), editWorker);
router.route('/:workerId').delete(hasPermission('canDeleteWorker'), deleteWorker);

router.use('/:workerId/training', TrainingRoutes);
router.use('/:workerId/qualification', QualificationRoutes);
router.use('/:workerId/mandatoryTraining', MandatoryTrainingRoutes);
router.use('/:workerId/trainingAndQualifications', TrainingAndQualificationsRoutes);

module.exports = router;
module.exports.editWorker = editWorker;
module.exports.viewAllWorkers = viewAllWorkers;
module.exports.getTotalWorkers = getTotalWorkers;
