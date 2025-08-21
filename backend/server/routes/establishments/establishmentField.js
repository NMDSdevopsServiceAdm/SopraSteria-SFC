const express = require('express');
const router = express.Router({ mergeParams: true });
const Establishment = require('../../models/classes/establishment');
const { hasPermission } = require('../../utils/security/hasPermission');
const HttpError = require('../../utils/errors/httpError');

const allowedPropertiesToBeRequested = ['EmployerType', 'Name', 'NumberOfStaff', 'ShareData'];

const getEstablishmentField = async (req, res) => {
  const establishmentId = req.establishmentId;
  const property = req.params?.property;

  const filteredProperties = ['Name', property];

  const showHistory =
    req.query.history === 'full' || req.query.history === 'property' || req.query.history === 'timeline' ? true : false;
  const showHistoryTime = req.query.history === 'timeline' ? true : false;
  const showPropertyHistoryOnly = req.query.history === 'property' ? true : false;

  const thisEstablishment = new Establishment.Establishment(req.username);
  try {
    checkIfRequestedPropertyIsAllowed(property);

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
      throw new HttpError('Establishment not found', 404);
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

    if (error instanceof HttpError) {
      return res.status(error.statusCode).send(error.message);
    }

    console.error('establishment::%s GET/:eID - failed', property, thisError.message);
    return res.status(500).send(thisError.safe);
  }
};

const updateEstablishmentFieldWithAudit = async (req, res) => {
  const establishmentId = req.establishmentId;
  const thisEstablishment = new Establishment.Establishment(req.username);

  const property = req.params?.property;

  const filteredProperties = ['Name', property];

  try {
    checkIfRequestedPropertyIsAllowed(property);
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
    console.error('Establishment::%s POST: ', property, error.message);
    if (error instanceof HttpError) {
      return res.status(error.statusCode).send(error.message);
    }
    return res.status(500).send('Failed to update %s for workplace', property);
  }
};

const checkIfRequestedPropertyIsAllowed = (property) => {
  if (!allowedPropertiesToBeRequested.includes(property)) {
    throw new HttpError('Requested property not allowed', 404);
  }
};

router.route('/:property').get(hasPermission('canViewEstablishment'), getEstablishmentField);
router.route('/:property').post(hasPermission('canEditEstablishment'), updateEstablishmentFieldWithAudit);

module.exports = router;
module.exports.getEstablishmentField = getEstablishmentField;
module.exports.updateEstablishmentFieldWithAudit = updateEstablishmentFieldWithAudit;
