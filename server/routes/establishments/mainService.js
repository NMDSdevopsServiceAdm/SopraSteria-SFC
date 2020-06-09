const express = require('express');
const router = express.Router({mergeParams: true});

// all user functionality is encapsulated
const Establishment = require('../../models/classes/establishment');
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



router.route('/').post(async (req, res) => {

  const establishmentId = req.establishmentId;
  const username = req.username;
  const addIsRegulated = false;
  const result = await updateMainService(establishmentId,username,req.body.mainService, addIsRegulated);
  if (result.success) {
    return res.status(200).json(result.data);
  } else {
    return res.status(result.errorCode).send(result.errorMsg);
  }
});
async function updateMainService(establishmentId, username, mainService,addIsRegulated = false){
  try {
    const thisEstablishment = new Establishment.Establishment(username);
    // before updating an Establishment, we need to be sure the Establishment is
    //  available to the given user. The best way of doing that
    //  is to restore from given UID
    // by loading the Establishment before updating it, we have all the facts about
    //  an Establishment (if needing to make inter-property decisions)
    if (await thisEstablishment.restore(establishmentId)) {
      // TODO: JSON validation
      // by loading after the restore, only those properties defined in the
      //  POST body will be updated (peristed)
      // With this endpoint we're only interested in name
      const payload = {
        mainService,
      };

      if (addIsRegulated) {
        payload.isRegulated = true;
      }
      const isValidEstablishment = await thisEstablishment.load(payload);
      // this is an update to an existing Establishment, so no mandatory properties!
      if (isValidEstablishment) {
        await thisEstablishment.save(username);
        return { success: true, data: thisEstablishment.toJSON(false, false, false, true, false, filteredProperties) };
      } else {
        return { success: false, errorMsg: 'Unexpected Input',errorCode: 400 };
      }

    } else {
      // not found worker
      return { success: false, errorMsg: 'Not Found' };
    }
  } catch (err) {

    if (err instanceof Establishment.EstablishmentExceptions.EstablishmentJsonException) {
      console.error("Establishment::mainService POST: ", err.message);
      return { success: false, errorMsg:err.safe,errorCode: 400 };

    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error("Establishment::mainService POST: ", err.message);
      return { success: false, errorMsg:err.safe, errorCode: 503 };
    } else {
      console.error("Unexpected exception: ", err);
    }
  }
}
router.route('/').post(updateMainService);
module.exports = router;
module.exports.updateMainService = updateMainService;
