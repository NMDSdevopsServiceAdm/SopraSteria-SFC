// worker extends from Establishment, because workers can only belong to an establishment
// by extending workers API from Establishment API endpoint, it leverages the existing
// route middleware for authenticating establishment id.

const express = require('express');
const router = express.Router({mergeParams: true});

// all worker functionality is encapsulated
const Workers = require('../../models/classes/worker');

// parent route defines the "id" parameter

// returns false on validation error, or an object with expected attributes on success
const validatePost = async (req) => {
    const expectedContractTypeValues = ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'];

    // TODO: JSON schema validation

    // mandatory fields when creating a worker:
    //  1. name/ID
    //  2. contract type
    //  3. main job title
    const givenNameId = req.body.nameOrId;
    const givenContract = req.body.contract;
    const givenMainJob = req.body.mainJob;

    // ensure the given job is one of the known jobs, which includes
    //  extracting title for a given ID or ID for a given title
    const validatedJob = await Workers.Worker.validateJob(givenMainJob);

    if ((givenNameId && givenNameId.length <= 50) &&
        (givenContract && expectedContractTypeValues.includes(givenContract)) &&
        (validatedJob)) {
        return {
            nameOrId: givenNameId,
            contract: givenContract,
            mainJob: {
                jobId: validatedJob.jobId,
                title: validatedJob.title
            }
        };
    } else {
        return false;
    }
};

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
        console.error('worker::POST - failed', thisError.message);
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

        console.error('worker::POST - failed', thisError.message);
        return res.status(503).send(thisError.safe);

    }

    return res.status(501).send(`Pending: fetch of specific worker with id (${workerId}) for establishment (${establishmentId})`);
});

// creates new worker
router.route('/').post(async (req, res) => {
    const establishmentId = req.establishmentId;
    const newWorker = new Workers.Worker(establishmentId);
    
    const expectedInput = await validatePost(req);
    if (!expectedInput) {
        return res.status(400).send('Unexpected Input; missing mandatory nameOrId, contractType or mainJob, or mainJob is not a valid job.');
    }

    try {
        newWorker.nameId = expectedInput.nameOrId;
        newWorker.contract = expectedInput.contract;
        newWorker.mainJob = expectedInput.mainJob;

        await newWorker.save();

        return res.status(201).json({
            uid: newWorker.uid
        });

    } catch (err) {
        const thisError = new Workers.WorkerExceptions.WorkerSaveException(newWorker.nameId, newWorker.uid, null, err, null);

        console.error('worker::POST - failed', thisError.message);
        return res.status(503).send(thisError.safe);
    }
    


    return res.status(501).send(`Pending: creation of new worker for establishment (${establishmentId})`);
});

// updates given worker id
router.route('/:workerId').put(async (req, res) => {
    const workerId = req.params.workerId;
    const establishmentId = req.establishmentId;

    return res.status(501).send(`Pending: update of worker with id (${workerId}) for establishment (${establishmentId})`);
});

// deletes given worker id
router.route('/:workerId').delete(async (req, res) => {
    const workerId = req.params.workerId;
    const establishmentId = req.establishmentId;

    return res.status(501).send(`Pending: delete of worker with id (${workerId}) for establishment (${establishmentId})`);
});

module.exports = router;