const express = require('express');
const router = express.Router({ mergeParams: true });
const lodash = require('lodash');
const Establishment = require('../../models/classes/establishment');
const { hasPermission } = require('../../utils/security/hasPermission');
const HttpError = require('../../utils/errors/httpError');

const allowedProperties = [
  'EmployerType',
  'Name',
  'NumberOfStaff',
  'ShareData',
  'StaffDoDelegatedHealthcareActivities',
  'PensionContribution',
  'PensionContributionPercentage',
  'StaffOptOutOfWorkplacePension',
  'TravelTimePay',
  'OfferSleepIn',
  'HowToPayForSleepIn',
];

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

  const property = extractParamProperty(req);
  const filteredProperties = propertiesToIncludeInReponse(property);

  try {
    checkIfRequestedPropertyIsAllowed(property);
    checkIfRequestBodyIsAllowed(req, property);

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

const extractParamProperty = (req) => {
  const propertyName = req.params?.property;
  return lodash.upperFirst(propertyName);
};

const propertiesToIncludeInReponse = (property) => {
  // special case handling as PensionContributionPercentage is a new column added lately
  if (property === 'PensionContribution') {
    return ['Name', 'PensionContribution', 'PensionContributionPercentage'];
  }

  return ['Name', property];
};

const checkIfRequestedPropertyIsAllowed = (property) => {
  if (!allowedProperties.includes(property)) {
    throw new HttpError('Requested property not allowed', 404);
  }
};

const checkIfRequestBodyIsAllowed = (req) => {
  const requestBody = req.body;
  const allRequestBodyFieldsAreAllowed = Object.keys(requestBody).every((field) =>
    allowedProperties.includes(lodash.upperFirst(field)),
  );

  if (!allRequestBodyFieldsAreAllowed) {
    throw new HttpError('Request body not allowed', 400);
  }
};

router.route('/:property').get(hasPermission('canViewEstablishment'), getEstablishmentField);
router.route('/:property').post(hasPermission('canEditEstablishment'), updateEstablishmentFieldWithAudit);

module.exports = router;
module.exports.getEstablishmentField = getEstablishmentField;
module.exports.updateEstablishmentFieldWithAudit = updateEstablishmentFieldWithAudit;
