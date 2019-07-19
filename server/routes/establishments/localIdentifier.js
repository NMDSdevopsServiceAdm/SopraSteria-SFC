const express = require('express');
const router = express.Router({mergeParams: true});

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

  const showHistory = req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId, showHistory)) {
      return res.status(200).json(thisEstablishment.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false, false, filteredProperties));
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
      `Failed to retrieve Establishment with id/uid: ${establishmentId}`);

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
        localIdentifier: req.body.localIdentifier
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
      console.error("Establishment::localidentifier POST: ", err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException && err.message == 'Duplicate LocalIdentifier') {
      console.error("Establishment::localidentifier POST: ", err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error("Establishment::localidentifier POST: ", err.message);
      return res.status(503).send(err.safe);
    } else {
      console.error("Unexpected exception: ", err);
      return res.status(503).send(err.safe);
    }
  }
});


// a helper function that updates the establishment and adds the necessary audit events
const updateLocalIdOnEstablishment = async (thisGivenEstablishment, transaction, updatedTimestamp, username, allAuditEvents) => {
console.log("WA DEBUG - updateLocalIdOnEstablishment - ", thisGivenEstablishment)

  const updatedEstablishment = await models.establishment.update(
    {
      LocalIdentifierValue: thisGivenEstablishment.value,
      LocalIdentifierSavedBy: username,
      LocalIdentifierChangedBy: username,
      LocalIdentifierSavedAt: updatedTimestamp,
      LocalIdentifierChangedAt: updatedTimestamp,
      updated: updatedTimestamp,
      updatedBy: username,
    },
    {
      returning: true,
      where: {
          uid: thisGivenEstablishment.uid
      },
      attributes: ['id', 'updated'],
      transaction,
    }
  );

  if (updatedEstablishment[0] === 1) {
    const updatedRecord = updatedEstablishment[1][0].get({plain: true});
    console.log("WA DEBUG - updated establishment: ", updatedRecord.EstablishmentID);
    // and now the audit events - one for the establishment entity
    allAuditEvents.push({
      establishmentFk: updatedRecord.EstablishmentID,
      username,
      type: 'updated'
    });

    // and two for the LocalIdentifier property (saved and changed)
    allAuditEvents.push({
      establishmentFk: updatedRecord.EstablishmentID,
      username,
      type: 'saved',
      property: 'LocalIdentifier',
    });
    allAuditEvents.push({
      establishmentFk: updatedRecord.EstablishmentID,
      username,
      type: 'changed',
      property: 'LocalIdentifier',
      event: {
        new: thisGivenEstablishment.value
      }
    });
  }

}

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

      // having restored their primary establishment and hence authenticated, we also fetch a list the user's current set of establishments
      const thisUser = new User(establishmentId);
      await thisUser.restore(null, username,false);
      const myEstablishments = await thisUser.myEstablishments(isParent);

      // create a list of those establishment UIDs - the user will only be able to update the local identifier for which they own
      const myEstablishmentUIDs = [];
      myEstablishmentUIDs.push(myEstablishments.primary.uid);

      if (myEstablishments.subsidaries) {
        myEstablishments.subsidaries.establishments.forEach(thisEst => {
          myEstablishmentUIDs.push(thisEst.uid);
        });
      }

      // within one transaction
      const updatedTimestamp = new Date();
      const updatedUids = [];
      await models.sequelize.transaction(async t => {
        const dbUpdatePromises = [];
        const allAuditEvents = [];
        givenLocalIdentifiers.forEach(thisGivenEstablishment => {
          if (thisGivenEstablishment && thisGivenEstablishment.uid && myEstablishmentUIDs.includes(thisGivenEstablishment.uid)) {
            const updateThisEstablishment = updateLocalIdOnEstablishment(thisGivenEstablishment, t, updatedTimestamp, username, allAuditEvents);
            dbUpdatePromises.push(updateThisEstablishment);
            updatedUids.push(thisGivenEstablishment);
          } else {
            // simply ignore it - silient operation, as the frontend is not going to give dodgy UIDs
          }
        });

        // wait for all updates to finish
        await Promise.all(dbUpdatePromises);
        await models.establishmentAudit.bulkCreate(allAuditEvents, {transaction: t});
      });

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
      if(err.parent.constraint && ( err.parent.constraint === 'establishment_LocalIdentifier_unq')){
          return res.status(400).send({duplicateValue: err.fields.LocalIdentifierValue});
      }
    }
    console.error("Establishment::localidentifier PUT: ", err.message);
    return res.status(503).send(err.message);
  }
});


module.exports = router;
