const express = require('express');
const router = express.Router({ mergeParams: true });

const Establishment = require('../../models/classes/establishment');
const filteredProperties = ['Name', 'ServiceUsers'];

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const showHistory =
    req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId, showHistory)) {
      // show only brief info on Establishment

      return res
        .status(200)
        .json(
          thisEstablishment.toJSON(
            showHistory,
            showPropertyHistoryOnly,
            showHistoryTime,
            false,
            false,
            filteredProperties,
          ),
        );
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
      `Failed to retrieve Establishment with id/uid: ${establishmentId}`,
    );

    console.error('establishment::serviceUsers GET/:eID - failed', thisError.message);
    return res.status(503).send(thisError.safe);
  }
});

// updates the current set of other services for the known establishment
router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);
  try {
    // before updating an Establishment, we need to be sure the Establishment is
    //  available to the given user. The best way of doing that
    //  is to restore from given UID
    // by loading the Establishment before updating it, we have all the facts about
    //  an Establishment (if needing to make inter-property decisions)
    if (await thisEstablishment.restore(establishmentId)) {
      // TODO: JSON validation

      // by loading after the restore, only those properties defined in the
      //  POST body will be updated (peristed)
      // With this endpoint we're only interested in service users
      const isValidEstablishment = await thisEstablishment.load({
        serviceUsers: req.body.serviceUsers,
      });

      // this is an update to an existing Establishment, so no mandatory properties!
      if (isValidEstablishment) {
        await thisEstablishment.save(req.username);

        // the POST response is not to return allOtherServices
        const jsonResponse = thisEstablishment.toJSON(false, false, false, true, false, filteredProperties);
        delete jsonResponse.allOtherServices;

        return res.status(200).json(jsonResponse);
      } else {
        return res.status(400).send('Unexpected Input.');
      }
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    if (err instanceof Establishment.EstablishmentExceptions.EstablishmentJsonException) {
      console.error('Establishment::serviceUsers POST: ', err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error('Establishment::serviceUsers POST: ', err.message);
      return res.status(503).send(err.safe);
    } else {
      console.error('Unexpected exception: ', err);
    }
  }
});

module.exports = router;
