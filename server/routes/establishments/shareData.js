const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../models');
const ShareFormatters = require('../../models/api/shareData');

// all user functionality is encapsulated
const Establishment = require('../../models/classes/establishment');
const filteredProperties = ['ShareData'];

// gets current 'share data' options for the known establishment
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  const showHistory = req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

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
    if (await thisEstablishment.restore(byID, byUUID, showHistory)) {
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

    console.error('establishment::share GET/:eID - failed', thisError.message);
    return res.status(503).send(thisError.safe);
  }
});

router.route('/alt').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name', 'ShareDataValue', 'shareWithCQC', 'shareWithLA']
    });

    if (results && results.id && (establishmentId === results.id)) {
      res.status(200);
      return res.json(formatSharedDataResponse(results));
    } else {
      return res.status(404).send('Not found');
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establistment::shareData GET - failed', err);
    return res.status(503).send(`Unable to retrive Establishment: ${req.params.id}`);
  }
});

// updates the current share options for the known establishment
router.route('/').post(async (req, res) => {
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
  
  const thisEstablishment = new Establishment.Establishment(req.username);


  try {
    // before updating an Establishment, we need to be sure the Establishment is
    //  available to the given user. The best way of doing that
    //  is to restore from given UID
    // by loading the Establishment before updating it, we have all the facts about
    //  an Establishment (if needing to make inter-property decisions)
    if (await thisEstablishment.restore(byID, byUUID)) {
      // TODO: JSON validation

      // by loading after the restore, only those properties defined in the
      //  POST body will be updated (peristed)
      // With this endpoint we're only interested in share (options)
      const isValidEstablishment = await thisEstablishment.load({
        share: req.body.share
      });

      // this is an update to an existing Establishment, so no mandatory properties!
      if (isValidEstablishment) {
        await thisEstablishment.save(req.username);

        return res.status(200).json(thisEstablishment.toJSON(false, false, false, true, false, filteredProperties));
      } else {
        return res.status(400).send('Unexpected Input.');
      }
        
    } else {
      // not found worker
      return res.status(404).send('Not Found');
    }
  } catch (err) {
    
    if (err instanceof Establishment.EstablishmentExceptions.EstablishmentJsonException) {
      console.error("Establishment::share POST: ", err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error("Establishment::share POST: ", err.message);
      return res.status(503).send(err.safe);
    } else {
      console.error("Unexpected exception: ", err);
    }
  }
});

const EXPECTED_SHARE_OPTIONS = ['CQC', 'Local Authority'];
router.route('/alt').post(async (req, res) => {
  const establishmentId = req.establishmentId;
  const shareOptions = req.body.share;

  // must provide "share" attribute
  if (!shareOptions || !typeof shareOptions.enabled === 'boolean') {
    console.error('establistment::shareData POST - unexpected share type: ', shareOptions);
    return res.status(400).send(`Unexpected share type: ${shareOptions}`);
  }

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name', 'ShareDataValue', 'shareWithCQC', 'shareWithLA']
    });

    if (results && results.id && (establishmentId === results.id)) {
      // we have found the establishment, update the share options

      // reset all share options to current values, except the overall share option to that as given
      let shareData = shareOptions.enabled;
      let shareCQC = results.shareWithCQC;
      let shareLA = results.shareWithLA;

      if (shareData) {
        // check for the 'with' option; if not given, then don't change the options
        if (shareOptions.with && Array.isArray(shareOptions.with)) {
          // if with is given, then we're resetting all options
          shareCQC=false; shareLA=false;
        
          shareOptions.with.forEach(thisOption => {
            if (EXPECTED_SHARE_OPTIONS.includes(thisOption)) {
              switch (thisOption) {
                case 'CQC':
                  shareCQC=true;
                  break;

                case 'Local Authority':
                case 'LA':
                  shareLA=true;
                  break;
              }
            }
          });
        }
      }
      
      // now update the Establishment's share options
      const revisedShareOptions = {
        ShareDataValue: shareOptions.enabled,
        shareWithCQC: shareCQC,
        shareWithLA: shareLA
      };
      await results.update(revisedShareOptions);
      
      res.status(200);
      return res.json(formatSharedDataResponse(results));
    } else {
      console.error('establistment::shareData POST - Not found establishment having id: ${establishmentId}', err);
      return res.status(404).send(`Not found establishment having id: ${establishmentId}`);
    }

  } catch (err) {
    // TODO - improve logging/error reporting
    console.error('establistment::shareData POST - failed', err);
    return res.status(503).send(`Unable to update Establishment with share option`);
  }
});


const formatSharedDataResponse = (establishment) => {
  // WARNING - do not be tempted to copy the database model as the API response; the API may chose to rename/contain
  //           some attributes (viz. locationId below)
  return {
    id: establishment.id,
    name: establishment.name,
    share: ShareFormatters.shareDataJSON(establishment)
  };
}

module.exports = router;