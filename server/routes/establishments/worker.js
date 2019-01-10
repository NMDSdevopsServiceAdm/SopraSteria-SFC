// worker extends from Establishment, because workers can only belong to an establishment
// by extending workers API from Establishment API endpoint, it leverages the existing
// route middleware for authenticating establishment id.

const express = require('express');
const router = express.Router({mergeParams: true});

// all worker functionality is encapsulated
const Workers = require('../../models/classes/worker');

// parent route defines the "id" parameter

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

    try {
        // for the time being, creates an empty worker
        // TODO: mandate nameId, contract and main job type
        newWorker.logLevel = Workers.Worker.LOG_INFO;
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