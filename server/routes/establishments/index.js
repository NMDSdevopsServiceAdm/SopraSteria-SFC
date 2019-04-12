// default route and registration of all sub routes
const express = require('express');
const router = express.Router();

const Authorization = require('../../utils/security/isAuthenticated');
const isLocal = require('../../utils/security/isLocalTest').isLocal;
const WdfUtils = require('../../utils/wdfEligibilityDate');

// all user functionality is encapsulated
const Establishment = require('../../models/classes/establishment');

const Name = require('./name');
const MainService = require('./mainService');
const EmployerType = require('./employerType');
const Services = require('./services');
const ServiceUsers = require('./serviceUsers');
const Capacity = require('./capacity');
const ShareData = require('./shareData');
const Staff = require('./staff');
const Jobs = require('./jobs');
const LA = require('./la');
const Worker = require('./worker');

// ensure all establishment routes are authorised
router.use('/:id', Authorization.hasAuthorisedEstablishment);
router.use('/:id/name', Name);
router.use('/:id/mainService', MainService);
router.use('/:id/employerType', EmployerType);
router.use('/:id/services', Services);
router.use('/:id/serviceUsers', ServiceUsers);
router.use('/:id/capacity', Capacity);
router.use('/:id/share', ShareData);
router.use('/:id/staff', Staff);
router.use('/:id/jobs', Jobs);
router.use('/:id/localAuthorities', LA);
router.use('/:id/worker', Worker);


// gets requested establishment
// optional parameter - "history" must equal "none" (default), "property", "timeline" or "full"
router.use('/:id', Authorization.hasAuthorisedEstablishment);
router.route('/:id').get(async (req, res) => {
    const establishmentId = req.establishmentId;
    const showHistory = req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
    const showHistoryTime = req.query.history === 'timeline' ? true : false;
    const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

    // validating establishment id - must be a V4 UUID or it's an id
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
    let byUUID = null, byID = null;
    if (typeof establishmentId === 'string' && uuidRegex.test(establishmentId.toUpperCase())) {
        byUUID = establishmentId;
    } else if (Number.isInteger(establishmentId)) {
      byID = parseInt(escape(establishmentId));
    } else {
      // unexpected establishment id
      return res.status(400).send();
    }

    let effectiveFrom = null;    
    if(isLocal(req) && req.query.effectiveFrom) {
        // can only override the WDF effective date in local dev/test environments
        effectiveFrom = new Date(req.query.effectiveFrom);
        
        // NOTE - effectiveFrom must include milliseconds and trailing Z - e.g. ?effectiveFrom=2019-03-01T12:30:00.000Z

        if (effectiveFrom.toISOString() !== req.query.effectiveFrom) {
            console.error('report/wdf/establishment/:eID - effectiveFrom parameter incorrect');
            return res.status(400).send();
        }
    } else {
        effectiveFrom = WdfUtils.wdfEligibilityDate();
    }

    const thisEstablishment = new Establishment.Establishment(req.username);

    try {
        if (await thisEstablishment.restore(byID, byUUID, showHistory && req.query.history !== 'property')) {
            // the property based framework for "other services" and "capacity services"
            //  is returning "allOtherServices" and "allServiceCapacities"
            //  we don't want those on the root GET establishment; only necessary for the
            //  direct GET endpoints "establishment/:eid/service" and
            //  establishment/:eid/service respectively
            const jsonResponse = thisEstablishment.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false)
            delete jsonResponse.allOtherServices;
            delete jsonResponse.allServiceCapacities;

            if (!showHistory) jsonResponse.wdf = await thisEstablishment.wdfToJson(effectiveFrom);

            // need also to return the WDF eligibility
            return res.status(200).json(jsonResponse);
        } else {
            // not found worker
            return res.status(404).send('Not Found');
        }

    } catch (err) {
        const thisError = new Establishment.EstablishmentExceptions.EstablishmentRestoreException(
            thisEstablishment.id,
            thisEstablishment.uid,
            null,
            err,
            null,
            `Failed to retrieve Establishment with id/uid: ${establishmentId}`);

        console.error('establishment::GET/:eID - failed', thisError.message);
        return res.status(503).send(thisError.safe);
    }
});

module.exports = router;
