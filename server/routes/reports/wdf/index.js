// WDF report route
const express = require('express');
const router = express.Router();

// security
const Authorization = require('../../../utils/security/isAuthenticated');
const isLocal = require('../../../utils/security/isLocalTest').isLocal;
const WdfUtils = require('../../../utils/wdfEligibilityDate');

// all user functionality is encapsulated
const Establishment = require('../../../models/classes/establishment');

// gets requested establishment
// optional parameter - "history" must equal "none" (default), "property", "timeline" or "full"
router.use('/establishment/:id', Authorization.hasAuthorisedEstablishment);
router.route('/establishment/:id').get(async (req, res) => {
    const establishmentId = req.establishmentId;

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

    const thisEstablishment = new Establishment.Establishment(req.username);

    try {
       // TODO - mock data
    //    const numStaff = this._isPropertyWdfBasicEligible(effectiveFromEpoch, this._properties.get('NumberOfStaff')) ? this._properties.get('NumberOfStaff').property : 0;
    //    myWdf['staff'] = numStaff === 0 ? false : Math.random() >= 0.5;                // TODO - cross-check numStaff against #workers (regardless of whether completed or not)
    //    myWdf['weightedStaff'] = Math.random() >= 0.5;                                 // TODO - true if >= 90% of #workers completed

        return res.status(200).send({
            establishmentUid: establishmentId,
            timestamp: new Date().toISOString(),
            effectiveFrom: effectiveFrom.toISOString(),
            wdf: {
                isEligible: Math.random() >= 0.5,
                workplace: Math.random() >= 0.5,
                staff: Math.random() >= 0.5,
            },
            customEffectiveFrom: isLocal(req) ? true : undefined
        });

    } catch (err) {
        console.error('report/wdf/establishment/:eID - failed', err);
        return res.status(503).send();
    }
});

module.exports = router;
