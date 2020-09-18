const express = require('express');
const router = express.Router({ mergeParams: true });

const Establishment = require('../../models/classes/establishment');
const filteredProperties = ['LocalIdentifier'];
const User = require('../../models/classes/user').User;
const models = require('../../models');

/*
    New endpoint `[GET]/[PUT] api/establishment/:eid/localIdentifier` - to retrieve and update the property "localIdentifier".
    Returns 400 if the given localidentifier is not unqiue.
    Returns 503 on service error.
    Otherwise returns 200 for GET and 202 for PUT.
*/

router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const showHistory =
    req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId, showHistory)) {
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

router.route('/').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId)) {
      const isValidEstablishment = await thisEstablishment.load({
        localIdentifier: req.body.localIdentifier,
      });

      if (isValidEstablishment) {
        await thisEstablishment.save(req.username);

        return res.status(202).json(thisEstablishment.toJSON(false, false, false, true, false, filteredProperties));
      } else {
        return res.status(400).send('Unexpected Input.');
      }
    } else {
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    if (err instanceof Establishment.EstablishmentExceptions.EstablishmentJsonException) {
      console.error('Establishment::localidentifier POST: ', err.message);
      return res.status(400).send(err.safe);
    } else if (
      err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException &&
      err.message == 'Duplicate LocalIdentifier'
    ) {
      console.error('Establishment::localidentifier POST: ', err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error('Establishment::localidentifier POST: ', err.message);
      return res.status(503).send(err.safe);
    } else {
      console.error('Unexpected exception: ', err);
      return res.status(503).send(err.safe);
    }
  }
});

// a workaround to allow updating all local identifiers for all given establishments in one transaction
router.route('/').put(async (req, res) => {
  const establishmentId = req.establishmentId;
  const isParent = req.isParent;
  const username = req.username;

  // validate input
  const givenLocalIdentifiers = req.body.localIdentifiers;
  if (!givenLocalIdentifiers || !Array.isArray(givenLocalIdentifiers)) {
    return res.status(400).send({});
  }

  const thisEstablishment = new Establishment.Establishment(username);

  try {
    // as a minimum for security purposes, we restore the user's primary establishment
    if (await thisEstablishment.restore(establishmentId)) {
      const updatedUids = await thisEstablishment.bulkUpdateLocalIdentifiers(username, givenLocalIdentifiers);

      const updatedTimestamp = new Date();
      return res.status(200).json({
        id: thisEstablishment.id,
        uid: thisEstablishment.uid,
        name: thisEstablishment.name,
        updated: updatedTimestamp.toISOString(),
        updatedBy: req.username,
        localIdentifiers: updatedUids,
      });
    } else {
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    if (err.name && err.name === 'SequelizeUniqueConstraintError') {
      if (err.parent.constraint && err.parent.constraint === 'establishment_LocalIdentifier_unq') {
        return res.status(400).send({ duplicateValue: err.fields.LocalIdentifierValue });
      }
    }
    console.error('Establishment::localidentifier PUT: ', err.message);
    return res.status(503).send(err.message);
  }
});

module.exports = router;
