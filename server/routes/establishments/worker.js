// worker extends from Establishment, because workers can only belong to an establishment
// by extending workers API from Establishment API endpoint, it leverages the existing
// route middleware for authenticating establishment id.

const express = require('express');
const router = express.Router({mergeParams: true});

const isLocal = require('../../utils/security/isLocalTest').isLocal;
const WdfUtils = require('../../utils/wdfEligibilityDate');

// all worker functionality is encapsulated
const Workers = require('../../models/classes/worker');

// parent route defines the "id" parameter

// child routes
const TrainingRoutes = require('./training');
const QualificationRoutes = require('./qualification');

// this middleware validates a worker against known establishment ID
const validateWorker = async (req, res, next) => {
    const workerId = req.params.workerId;
    const establishmentId = req.establishmentId;

    // if the request for this worker is by a user associated with parent, and the requested establishment is
    //  not their primary establishment, then they must have been granted "staff" level permission to access the worker
    if (req.isParent && req.establishmentId !== req.establishment.id) {
        // the requestor is both a parent and they are requesting against non-primary establishment (aka a subsidiary)
        if (req.parentPermissions === null ||
            req.parentPermissions !== "Workplace and Staff") {
                console.error("validateWorker authorisation - parent is requesting a subdiaries worker without required permission");
                return res.status(403).send('Not Found');
        }
    }


    if (workerId) {
        // validating worker id - must be a V4 UUID
        const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
        if (!uuidRegex.test(workerId.toUpperCase())) return res.status(400).send('Unexpected worker id');

        const thisWorker = new Workers.Worker(establishmentId);

        try {
            if (await thisWorker.restore(workerId, false)) {
                next();
            } else {
                // not found worker
                return res.status(404).send('Not Found');
            }

        } catch (err) {
            console.error('worker::validateWorker - failed', err);
            return res.status(503).send();
        }
    } else {
        next();
    }
};

router.use('/', validateWorker);
router.use('/:workerId/training', [validateWorker, TrainingRoutes]);
router.use('/:workerId/qualification', [validateWorker, QualificationRoutes]);

// gets all workers
router.route('/').get(async (req, res) => {
    const establishmentId = req.establishmentId;

    try {
        const allTheseWorkers = await Workers.Worker.fetch(establishmentId);
        return res.status(200).json({
            workers: allTheseWorkers
        });
    } catch (err) {
        console.error('worker::GET:all - failed', err);
        return res.status(503).send('Failed to get workers for establishment having id: '+establishmentId);
    }
});

// gets requested worker id
// optional parameter - "history" must equal 1
router.route('/:workerId').get(async (req, res) => {
    const workerId = req.params.workerId;
    const establishmentId = req.establishmentId;
    const showHistory = req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
    const showHistoryTime = req.query.history === 'timeline' ? true : false;
    const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

    // validating worker id - must be a V4 UUID
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    if (!uuidRegex.test(workerId.toUpperCase())) return res.status(400).send('Unexpected worker id');

    const thisWorker = new Workers.Worker(establishmentId);

    try {
        if (await thisWorker.restore(workerId, showHistory && req.query.history !== 'property')) {
            const jsonResponse = thisWorker.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false);
            if (!showHistory) jsonResponse.wdf = await thisWorker.wdfToJson();

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
            `Failed to retrieve worker with uid: ${workerId}`);

        console.error('worker::GET/:workerId - failed', thisError.message);
        return res.status(503).send(thisError.safe);
    }
});

// creates new worker
router.route('/').post(async (req, res) => {
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
            console.error("Worker POST: ", err.message);
            return res.status(400).send(err.safe);
        } else if (err instanceof Workers.WorkerExceptions.WorkerSaveException) {
            console.error("Worker POST: ", err.message);
            return res.status(503).send(err.safe);
        }
        console.error("Worker POST: unexpected exception: ", err);
        return res.status(503).send();
    }
});

// updates given worker id
router.route('/:workerId').put(async (req, res) => {
    const workerId = req.params.workerId;
    const establishmentId = req.establishmentId;

    // validating worker id - must be a V4 UUID
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    if (!uuidRegex.test(workerId.toUpperCase())) return res.status(400).send('Unexpected worker id');
    
    const thisWorker = new Workers.Worker(establishmentId);
    
    try {
        // before updating a Worker, we need to be sure the Worker is
        //  available to the given establishment. The best way of doing that
        //  is to restore from given UID
        if (await thisWorker.restore(workerId)) {
            // TODO: JSON validation

            // by loading after the restore, only those properties defined in the
            //  PUT body will be updated (peristed)
            const isValidWorker = await thisWorker.load(req.body);

            // this is an update to an existing Worker, so no mandatory properties!
            if (isValidWorker) {
                await thisWorker.save(req.username);

                const exceptionalOverrideHeader = req.headers['x-override-put-return-all'];
                const showModifiedOnly = exceptionalOverrideHeader ? false : true;
                return res.status(200).json(thisWorker.toJSON(false, false, false, showModifiedOnly));
            } else {
                return res.status(400).send('Unexpected Input.');
            }
            
        } else {
            // not found worker
            return res.status(404).send('Not Found');
        }

    } catch (err) {
        if (err instanceof Workers.WorkerExceptions.WorkerSaveException && err.message == 'Duplicate LocalIdentifier') {
            console.error("Worker::localidentifier PUT: ", err.message);
            return res.status(400).send(err.safe);
        } else if (err instanceof Workers.WorkerExceptions.WorkerJsonException) {
            console.error("Worker PUT: ", err.message);
            return res.status(400).send(err.safe);
        } else if (err instanceof Workers.WorkerExceptions.WorkerSaveException) {
            console.error("Worker PUT: ", err.message);
            return res.status(503).send(err.safe);
        }
    }
});

// deletes given worker id
router.route('/:workerId').delete(async (req, res) => {
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
                reason
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
            console.error("Worker DELETE: ", err.message);
            return res.status(503).send(err.safe);
        } else {
            console.error("Worker DELETE - unexpected exception: ", err);
            return res.status(500).send();
        }
    }
});

module.exports = router;