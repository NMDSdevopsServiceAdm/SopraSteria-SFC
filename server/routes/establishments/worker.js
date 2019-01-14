// worker extends from Establishment, because workers can only belong to an establishment
// by extending workers API from Establishment API endpoint, it leverages the existing
// route middleware for authenticating establishment id.

const express = require('express');
const router = express.Router({mergeParams: true});

// all worker functionality is encapsulated
const Workers = require('../../models/classes/worker');

// parent route defines the "id" parameter

// middleware to validate the establishment on all worker endpoints
const validateEstablishment = async (req, res, next) => {
    const establishmentId = req.establishmentId;
    const validatedEstablishment = await Workers.Worker.validateEstablishment(establishmentId);
    if (!validatedEstablishment) {
        return res.status(404).send('Establishment unknown.');
    } else {
        next();
    }
};

router.use('/', validateEstablishment);

// gets all workers
router.route('/').get(async (req, res) => {
    const establishmentId = req.establishmentId;
    try {
        const allTheseWorkers = await Workers.Worker.fetch(establishmentId);
        return res.status(200).json({
            workers: allTheseWorkers
        });
    } catch (err) {
        console.error('worker::GET:all - failed', thisError.message);
        return res.status(503).send('Failed to get workers for establishment having id: '+establishmentId);
    }
});

// gets requested worker id
router.route('/:workerId').get(async (req, res) => {
    const workerId = req.params.workerId;
    const establishmentId = req.establishmentId;

    // validating worker id - must be a V4 UUID
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    if (!uuidRegex.test(workerId.toUpperCase())) return res.status(400).send('Unexpected worker id');

    const thisWorker = new Workers.Worker(establishmentId);

    try {
        if (await thisWorker.restore(workerId)) {
            return res.status(200).json(thisWorker.toJSON());
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
            `Failed to retrieve worker with uid: ${thisWorker.uid}`);

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
            await newWorker.save();
            return res.status(201).json({
                uid: newWorker.uid
            });
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
    }
});

// updates given worker id
router.route('/:workerId').put(async (req, res) => {
    const workerId = req.params.workerId;
    const establishmentId = req.establishmentId;

    // The put can update any, multiple or all aspects of a worker.

    // There are no mandatory properties of a PUT; all properties are optional.

    // But when given, a properties must fully validate; in the main, that
    //  is conformig to JSON schema, but each property will have it's own
    //  specific validation; for example, when updating the main job, the
    //  job given must be one of the known jobs.

    // Rather than a set of fixed monolithic rules for parsing and
    //  validation, each property of a Worker will parse and validate
    //  itself, making it easy, scalable and automic to add new properties.

    // This is true not just of PUT (update) operator but the GET (restore)
    //   operator too. Any number of properties could have been provided
    //   and stored; consequently, any number of properties need to be restored. 

    // There are 20+ properties of a Worker.

    // Using a Gang of Four "Prototype" pattern, whereby the Worker manages a set
    //   of Prototypes. Each attribute is a prototype.

    return res.status(501).send(`Pending: update of worker with id (${workerId}) for establishment (${establishmentId})`);
});

// deletes given worker id
router.route('/:workerId').delete(async (req, res) => {
    const workerId = req.params.workerId;
    const establishmentId = req.establishmentId;

    return res.status(501).send(`Pending: delete of worker with id (${workerId}) for establishment (${establishmentId})`);
});

module.exports = router;