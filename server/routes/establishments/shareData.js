const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../models');
const ShareFormatters = require('../../models/api/shareData');

// parent route defines the "id" parameter

// gets current 'share data' options for the known establishment
router.route('/').get(async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    let results = await models.establishment.findOne({
      where: {
        id: establishmentId
      },
      attributes: ['id', 'name', 'shareData', 'shareWithCQC', 'shareWithLA']
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
const EXPECTED_SHARE_OPTIONS = ['CQC', 'Local Authority'];
router.route('/').post(async (req, res) => {
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
      attributes: ['id', 'name', 'shareData', 'shareWithCQC', 'shareWithLA']
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
        shareData: shareOptions.enabled,
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
    return res.status(503).send(`Unable to update Establishment with employer type: ${req.params.id}/${givenEmployerType}`);
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