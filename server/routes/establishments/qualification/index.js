// default route for Workers' qualification endpoint
const express = require('express');
const router = express.Router({mergeParams: true});

// all user functionality is encapsulated
const Qualification = require('../../../models/classes/qualification').Qualification;
const QualificationDuplicateException = require('../../../models/classes/qualification').QualificationDuplicateException;

// NOTE - the Worker route uses middleware to validate the given worker id against the known establishment
//        prior to all qualification endpoints, thus ensuring we this necessary rigidity on Establishment/Worker relationship
//        for qualification records.

// returns a list of all qualification records for the given worker UID
// Inherits the security middleware declared in the Worker route for qualification.
// Inheirts the "workerUid" parameter declared in the Worker route for qualification.
router.route('/').get(async (req, res) => {
    // although the establishment id is passed as a parameter, get the authenticated  establishment id from the req
    const establishmentId = req.establishmentId;
    const workerUid = req.params.workerId;

    try {
        const allQualificationRecords = await Qualification.fetch(establishmentId, workerUid);
        return res.status(200).json(allQualificationRecords);
    } catch (err) {
        console.error('Qualification::root - failed', err);
        return res.status(503).send(`Failed to get Qualification Records for Worker having uid: ${workerUid}`);
    }
});

// returns the set of qualifications that are available to the given worker; this all qualifications except those
//  already consumed by this worker
router.route('/available').get(async (req, res) => {
    // although the establishment id is passed as a parameter, get the authenticated  establishment id from the req
    const establishmentId = req.establishmentId;
    const workerUid = req.params.workerId;
    const byType = req.query.type;

    const thisQualificationRecord = new Qualification(establishmentId, workerUid);

    try {
        const remainingQualifications = await thisQualificationRecord.myAvailableQualifications(byType);
        if (remainingQualifications !== false) {
            return res.status(200).json({
                workerId: workerUid,
                type: byType,
                count: remainingQualifications.length,
                qualifications: remainingQualifications
            });
        } else {
            return res.status(400).send();
        }

    } catch (err) {
        console.error('Qualification::root - failed', err);
        return res.status(503).send(`Failed to get available Qualification (Types) for Worker having uid: ${workerUid}`);
    }
});

// gets requested qualification record using the qualification uid
router.route('/:qualificationUid').get(async (req, res) => {
    const establishmentId = req.establishmentId;
    const qualificationUid = req.params.qualificationUid;
    const workerUid = req.params.workerId;

    const thisQualificationRecord = new Qualification(establishmentId, workerUid);

    try {
        if (await thisQualificationRecord.restore(qualificationUid)) {
            return res.status(200).json(thisQualificationRecord.toJSON());
        } else {
            // not found qualification record
            return res.status(404).send('Not Found');
        }

    } catch (err) {
        console.error(err);
        return res.status(503).send();
    }
});

// creates given qualification record for the 'given' worker by UID
router.route('/').post(async (req, res) => {
    const establishmentId = req.establishmentId;
    const workerUid = req.params.workerId;

    const thisQualificationRecord = new Qualification(establishmentId, workerUid);
    
    try {
        // by loading after the restore, only those properties defined in the
        //  PUT body will be updated (peristed)
        const isValidRecord = await thisQualificationRecord.load(req.body);

        // this is an update to an existing User, so no mandatory properties!
        if (isValidRecord) {
            await thisQualificationRecord.save(req.username);

            return res.status(200).json(thisQualificationRecord.toJSON());
        } else {
            return res.status(400).send('Unexpected Input.');
        }

    } catch (err) {
        console.error(err);

        // catch duplicate exception
        if (err instanceof QualificationDuplicateException) {
            return res.status(400).send();
        }

        return res.status(503).send();
    }
});


// updates requested qualification record using the qualification uid
router.route('/:qualificationUid').put(async (req, res) => {
    const establishmentId = req.establishmentId;
    const qualificationUid = req.params.qualificationUid;
    const workerUid = req.params.workerId;

    const thisQualificationRecord = new Qualification(establishmentId, workerUid);
    
    try {
        // before updating a Worker, we need to be sure the Worker is
        //  available to the given establishment. The best way of doing that
        //  is to restore from given UID
        if (await thisQualificationRecord.restore(qualificationUid)) {
            // TODO: JSON validation

            // by loading after the restore, only those properties defined in the
            //  PUT body will be updated (peristed)
            const isValidRecord = await thisQualificationRecord.load(req.body);

            // this is an update to an existing User, so no mandatory properties!
            if (isValidRecord) {
                await thisQualificationRecord.save(req.username);

                return res.status(200).json(thisQualificationRecord.toJSON());
            } else {
                return res.status(400).send('Unexpected Input.');
            }
            
        } else {
            // not found worker
            return res.status(404).send('Not Found');
        }

    } catch (err) {
        console.error(err);

        // catch duplicate exception
        if (err instanceof QualificationDuplicateException) {
            return res.status(400).send();
        }
        
        return res.status(503).send();
    }
});


// deletes requested qualification record using the qualification uid
router.route('/:qualificationUid').delete(async (req, res) => {
    const establishmentId = req.establishmentId;
    const qualificationUid = req.params.qualificationUid;
    const workerUid = req.params.workerId;

    const thisQualificationRecord = new Qualification(establishmentId, workerUid);
    
    try {
        // before updating a Worker, we need to be sure the Worker is
        //  available to the given establishment. The best way of doing that
        //  is to restore from given UID
        if (await thisQualificationRecord.restore(qualificationUid)) {
            // TODO: JSON validation

            // by deleting after the restore we can be sure this qualification record belongs to the given worker
            const deleteSuccess = await thisQualificationRecord.delete();

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

module.exports = router;