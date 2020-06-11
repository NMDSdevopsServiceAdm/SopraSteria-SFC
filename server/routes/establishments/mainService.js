const models = require('../../models/index');
const EstablishmentExceptions = require('../../models/classes/establishment/establishmentExceptions');

const express = require('express');
const router = express.Router({mergeParams: true});

// all user functionality is encapsulated
const Establishment = require('../../models/classes/establishment');
const {correctCapacities} = require('../../utils/correctCapacities');
const {correctServices} = require('../../utils/correctServices');

const filteredProperties = ['Name', 'MainServiceFK', 'CapacityServices'];

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
    const thisError = new EstablishmentExceptions.EstablishmentRestoreException(
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
      return setMainService(req, res, thisEstablishment);
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {

    if (err instanceof EstablishmentExceptions.EstablishmentJsonException) {
      console.error("Establishment::mainService POST: ", err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof EstablishmentExceptions.EstablishmentSaveException) {
      console.error("Establishment::mainService POST: ", err.message);
      return res.status(503).send(err.safe);
    } else {
      console.error("Unexpected exception: ", err);
    }
  }
});

async function changeMainService(res, establishment, cqc, mainService, username) {
  // TODO: JSON validation

  const services = await correctServices(establishment, cqc, mainService);
  const capacities = await correctCapacities(establishment, mainService, services);

  // by loading after the restore, only those properties defined in the
  //  POST body will be updated (persisted)
  // With this endpoint we're only interested in name
  const isValidEstablishment = await establishment.load({
    mainService,
    services,
    capacities,
    isRegulated: cqc
  });

  // this is an update to an existing Establishment, so no mandatory properties!
  if (isValidEstablishment) {
    await establishment.save(username);

    return res.status(200).json(establishment.toJSON(false, false, false, true, false, filteredProperties));
  } else {
    return res.status(400).send('Unexpected Input.');
  }
}

async function setMainService(req, res, establishment) {
  const mainService = req.body.mainService;
  const username = req.username;
  const user = await models.user.findByUUID(req.userUid);
  const cqc = req.body.cqc !== null ? req.body.cqc : establishment.isRegulated;

  // No switch, same as previous behaviour.
  if (cqc === establishment.isRegulated) {
    return changeMainService(res, establishment, cqc, mainService, username);
  } else if (cqc) { // Non-CQC -> CQC
    await models.Approvals.create({
      EstablishmentID: establishment.id,
      UserID: user.id,
      Status: 'Pending',
      ApprovalType: 'CqcStatusChange',
      Data: {
        requestedService: {
          id: mainService.id,
          name: mainService.name,
        },
        currentService: {
          id: establishment.mainService.id,
          name: establishment.mainService.name,
          ...(establishment.mainService.other && { other: establishment.mainService.other }),
        }
      }
    });

    return res.status(200).json(establishment.toJSON(false, false, false, true, false, filteredProperties));
  } else { // CQC -> Non-CQC
    return changeMainService(res, establishment, cqc, mainService, username);
  }
}

module.exports = router;
module.exports.setMainService = setMainService;
module.exports.changeMainService = changeMainService;
