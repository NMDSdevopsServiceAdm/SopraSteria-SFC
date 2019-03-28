// WDF report route
const express = require('express');
const router = express.Router();

const Authorization = require('../../../utils/security/isAuthenticated');

// all user functionality is encapsulated
const Establishment = require('../../../models/classes/establishment');

// gets requested establishment
// optional parameter - "history" must equal "none" (default), "property", "timeline" or "full"
router.use('/establishment/:id', Authorization.hasAuthorisedEstablishment);
router.route('/establishment/:id').get(async (req, res) => {
    const establishmentId = req.establishmentId;
    let effectiveFrom = null;
    
    if(req.query.effectiveFrom) {
        effectiveFrom = new Date(req.query.effectiveFrom);
        
        // NOTE - effectiveFrom must include milliseconds and trailing Z - e.g. ?effectiveFrom=2018-04-01T00:00:00.000Z

        if (effectiveFrom.toISOString() !== req.query.effectiveFrom) {
            console.error('report/wdf/establishment/:eID - effectiveFrom parameter incorrect');
            return res.status(400).send();
        }
    } else {
        // calculate the effective from date
        const today = new Date();
        const yearStartMonth = 3;           // April (months start at 0)
        if (today.getMonth() < 3) {
            effectiveFrom = new Date(Date.UTC(today.getFullYear()-1, 3, 1));
        } else {
            effectiveFrom = new Date(Date.UTC(today.getFullYear(), 3, 1));
        }
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
        return res.status(200).send({
            establishmentUid: establishmentId,
            timestamp: new Date().toISOString(),
            effectiveFrom: effectiveFrom.toISOString(),
            wdf: {
                isEligible: Math.random() >= 0.5,
                workplace: Math.random() >= 0.5,
                staff: Math.random() >= 0.5,
            }
        });

    } catch (err) {
        console.error('report/wdf/establishment/:eID - failed', err);
        return res.status(503).send();
    }
});

module.exports = router;
