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

// gets requested worker id
router.route('/:workerId').get(async (req, res) => {
    const workerId = req.params.workerId;
    const establishmentId = req.establishmentId;

    return res.status(501).send(`Pending: fetch of specific worker with id (${workerId}) for establishment (${establishmentId})`);
});

// gets all workers
router.route('/').get(async (req, res) => {
    const establishmentId = req.establishmentId;

    return res.status(501).send(`Pending: fetch of all workers for establishment (${establishmentId})`);
});

// creates new worker
router.route('/').post(async (req, res) => {
    const establishmentId = req.establishmentId;
    const newWorker = new Workers.Worker(establishmentId);

    // TODO: INFO logging on Worker; change to LOG_ERROR only
    newWorker.logLevel = Workers.Worker.LOG_INFO;

    const expectedInput = await validatePost(req);

    if (!expectedInput) {
        return res.status(400).send('Unexpected Input; missing mandatory nameOrId, contractType or mainJob, or mainJob is not a valid job.');
    }

    const validatedEstablishment = await Workers.Worker.validateEstablishment(establishmentId);
    if (!validatedEstablishment) {
        return res.status(404).send('Establishment unknown.');
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
        // TODO: pass the name
        const thisError = new Workers.WorkerExceptions.WorkerSaveException(null, newWorker.uid, null, err, null);

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