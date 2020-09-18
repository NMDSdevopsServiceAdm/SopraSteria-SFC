const express = require('express');
const router = express.Router({ mergeParams: true });

const Establishment = require('../../models/classes/establishment');

// checks across ALL local identifiers for a given primary establishment and the establishments' workers, and if a parent all the sub's and their workers too
//  Returns a simple status of "true" if all establishments and workers have a local identifier, otherwise returns false.
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    // must restore the establishment - to assert security and availability
    if (await thisEstablishment.restore(establishmentId, false)) {
      const missingLocalIds = await thisEstablishment.missingLocalIdentifiers();
      return res.status(200).json({
        establishments: missingLocalIds,
      });
    } else {
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    const thisError = new Establishment.EstablishmentExceptions.EstablishmentRestoreException(
      thisEstablishment.id,
      thisEstablishment.uid,
      null,
      err,
      null,
      `Failed to retrieve Establishment with id/uid: ${establishmentId}`,
    );

    console.error('establishment::localIdentifier GET/:eID - failed', thisError.message);
    return res.status(503).send(thisError.safe);
  }
});

module.exports = router;
