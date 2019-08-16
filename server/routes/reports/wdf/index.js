// WDF report route
const express = require('express');
const router = express.Router();

// security
const Authorization = require('../../../utils/security/isAuthenticated');
const isLocal = require('../../../utils/security/isLocalTest').isLocal;

// all user functionality is encapsulated
const Establishment = require('../../../models/classes/establishment').Establishment;
const Worker = require('../../../models/classes/worker').Worker;
const WdfCalculator = require('../../../models/classes/wdfCalculator').WdfCalculator;

// gets requested establishment
// optional parameter - "history" must equal "none" (default), "property", "timeline" or "full"
router.use('/establishment/:id', Authorization.hasAuthorisedEstablishment);
router.route('/establishment/:id').get(async (req, res) => {
    const establishmentId = req.establishmentId;

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

    try {
        const wdfReport = await WdfCalculator.report(byID, byUUID);

        if (wdfReport === false) return res.status(404).send('Not Found');

        return res.status(200).send({
            establishmentId: byID ? byID : undefined,
            establishmentUid: byUUID ? byUUID : undefined,
            timestamp: new Date().toISOString(),
            effectiveFrom: WdfCalculator.effectiveDate.toISOString(),
            wdf: wdfReport,
            customEffectiveFrom: isLocal(req) ? true : undefined
        });

    } catch (err) {
        console.error('report/wdf/establishment/:eID - failed', err);
        return res.status(503).send();
    }
});

router.route('/establishment/:id/override').get(async (req, res) => {
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

      WdfCalculator.effectiveDate = effectiveFrom;
  } else {
      // reset the WDF calculator's effective date
      WdfCalculator.effectiveDate = null;
      effectiveFrom = WdfCalculator.effectiveDate;
  }

    return res.status(200).send();
});

module.exports = router;
