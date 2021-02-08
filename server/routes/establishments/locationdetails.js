const express = require('express');
const router = express.Router({ mergeParams: true });
const { hasPermission } = require('../../utils/security/hasPermission');

const pCodeCheck = require('../../utils/postcodeSanitizer');

// all user functionality is encapsulated
const models = require('../../models');
const Establishment = require('../../models/classes/establishment');
const filteredProperties = ['LocationId', 'Address1', 'Address2', 'Address3', 'Town', 'County', 'Postcode', 'Name'];

// gets current employer type for the known establishment
const getLocationDetails = async (req, res) => {
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

    console.error('establishment::cqcLocationId GET/:eID - failed', thisError.message);
    return res.status(503).send(thisError.safe);
  }
};

// updates the current employer type for the known establishment
const updateLocationDetails = async (req, res) => {
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

      const newPostcode = pCodeCheck.sanitisePostcode(req.body.postalCode);

      if (newPostcode && newPostcode !== thisEstablishment.postcode) {
        const { Latitude, Longitude } = (await models.postcodes.firstOrCreate(newPostcode)) || {};

        req.body.postalCode = newPostcode;
        req.body.Latitude = Latitude;
        req.body.Longitude = Longitude;
      }

      // by loading after the restore, only those properties defined in the
      //  POST body will be updated (peristed)
      // With this endpoint we're only interested in locationId and address
      const isValidEstablishment = await thisEstablishment.load({
        locationId: req.body.locationId ? req.body.locationId : null,
        address1: req.body.addressLine1,
        address2: req.body.addressLine2 ? req.body.addressLine2 : null,
        address3: req.body.addressLine3 ? req.body.addressLine3 : null,
        town: req.body.townCity,
        county: req.body.county,
        postcode: newPostcode,
        Latitude: req.body.Latitude,
        Longitude: req.body.Longitude,
        name: req.body.locationName,
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
      console.error('Establishment::mainService POST: ', err.message);
      return res.status(400).send(err.safe);
    } else if (err instanceof Establishment.EstablishmentExceptions.EstablishmentSaveException) {
      console.error('Establishment::mainService POST: ', err.message);
      return res.status(503).send(err.safe);
    } else {
      console.error('Unexpected exception: ', err);
    }
  }
};

router.route('/').get(hasPermission('canViewEstablishment'), getLocationDetails);
router.route('/').post(hasPermission('canEditEstablishment'), updateLocationDetails);

module.exports = router;
