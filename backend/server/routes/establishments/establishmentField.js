const express = require('express');
const router = express.Router({ mergeParams: true });
const Establishment = require('../../models/classes/establishment');
const { hasPermission } = require('../../utils/security/hasPermission');
const HttpError = require('../../utils/errors/httpError');

let filteredProperties = ['Name']

const getEstablishmentField = async (req, res) => {
  const establishmentId = req.establishmentId;
  const property = req.params?.property;

  filteredProperties.push(property);

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
  } catch (error) {
    const thisError = new Establishment.EstablishmentExceptions.EstablishmentRestoreException(
      thisEstablishment.id,
      thisEstablishment.uid,
      null,
      error,
      null,
      `Failed to retrieve Establishment with id/uid: ${establishmentId}`,
    );

    console.error(`establishment::${property} GET/:eID - failed`, thisError.message);
    return res.status(500).send(thisError.safe);
  }
};

const updateEstablishmentFieldWithAudit = async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  const property = req.params?.property;

  filteredProperties.push(property);

  try {
    const establishmentFound = await thisEstablishment.restore(establishmentId);

    if (!establishmentFound) {
      throw new HttpError('Establishment not found', 404);
    }

    const isValidEstablishment = await thisEstablishment.load(req.body);

    if (!isValidEstablishment) {
      throw new HttpError('Request is invalid', 400);
    }

    await thisEstablishment.save(req.username);
    return res.status(200).json(thisEstablishment.toJSON(false, false, false, true, false, filteredProperties));
  } catch (error) {
    console.error(`Establishment::${property} POST: `, error.message);
    if (error instanceof HttpError) {
      return res.status(error.statusCode).send(error.message);
    }
    return res.status(500).send(`Failed to update ${property} for workplace`);
  }
};

router.route('/:property').get(hasPermission('canViewEstablishment'), getEstablishmentField);
router.route('/:property').post(hasPermission('canEditEstablishment'), updateEstablishmentFieldWithAudit);

module.exports = router;
module.exports.getEstablishmentField = getEstablishmentField;
module.exports.updateEstablishmentFieldWithAudit = updateEstablishmentFieldWithAudit;
