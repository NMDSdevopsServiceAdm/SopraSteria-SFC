
const express = require('express');
const router = express.Router({mergeParams: true});

// all user functionality is encapsulated
const Establishment = require('../../models/classes/establishment');
const EstablishmentJsonException = require('../../models/classes/establishment/establishmentExceptions').EstablishmentJsonException;

const filteredProperties = ['Name', 'MainServiceFK'];

// gets current employer type for the known establishment
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const showHistory = req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

  const thisEstablishment = new Establishment.Establishment(req.username);

  try {
    if (await thisEstablishment.restore(establishmentId, showHistory)) {
      // show only brief info on Establishment

      return res.status(200).json(thisEstablishment.toJSON(showHistory, showPropertyHistoryOnly, showHistoryTime, false, false, filteredProperties));
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

    console.error('establishment::mainService GET/:eID - failed', thisError.message);
    return res.status(503).send(thisError.safe);
  }
});

// updates the current employer type for the known establishment
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
      const output = await setMainService(thisEstablishment, req.body.mainService, req.username, req.body.cqc);
      return res.status(200).json(output);
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {

    if (err instanceof Establishment.EstablishmentExceptions.EstablishmentJsonException) {
      console.error("Establishment::mainService POST: ", err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error("Establishment::mainService POST: ", err.message);
      return res.status(503).send(err.safe);
    } else {
      console.error("Unexpected exception: ", err);
    }
  }
});

async function changeMainService(establishment, mainService, username) {
  const isValidEstablishment = await establishment.load({
    mainService: mainService
  });

  if (isValidEstablishment) {
    await establishment.save(username);

    return establishment.toJSON(false, false, false, true, false, filteredProperties);
  } else {
    throw new EstablishmentJsonException('Unexpected Input.');
  }
}

async function deregulateEstablishment(establishment, username) {
  const isValidEstablishment = await establishment.load({
    isRegulated: false
  });

  if (isValidEstablishment) {
    await establishment.save(username);

    return establishment.toJSON(false, false, false, true, false, filteredProperties);
  } else {
    throw new EstablishmentJsonException('Unexpected Input.');
  }
}

async function setMainService(establishment, mainService, username, cqc) {
  if (cqc === undefined) {
    cqc = establishment.isRegulated;
  }

  // No switch, same as previous behaviour.
  if (cqc === establishment.isRegulated) {
    await changeMainService(establishment, mainService, username);
  } else if (cqc) { // Non-CQC -> CQC

  } else { // CQC -> Non-CQC
    await changeMainService(establishment, mainService, username);
    await deregulateEstablishment(establishment, username);
  }
}

module.exports = router;
module.exports.setMainService = setMainService;
