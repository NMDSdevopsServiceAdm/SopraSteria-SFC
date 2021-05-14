'use strict';
const router = require('express').Router();
const CQCDataAPI = require('../../utils/CQCDataAPI');
const { celebrate, Joi, errors } = require('celebrate');

const cqcStatusCheck = async (req, res) => {
  const locationID = req.params.locationID;
  const postcode = req.query.postcode;
  const mainService = req.query.mainService;

  const result = {};

  try {
    const workplaceCQCData = await CQCDataAPI.getWorkplaceCQCData(locationID);

    console.log(workplaceCQCData);

    const cqcStatusMatch =
      checkRegistrationStatus(workplaceCQCData.registrationStatus) &&
      checkPostcodeMatch(postcode, workplaceCQCData.postalCode) &&
      checkMainServiceMatch(mainService, workplaceCQCData.gacServiceTypes);

    result.cqcStatusMatch = cqcStatusMatch;
  } catch (error) {
    // If the CQC API responds with a 404, we treat that as an unregistered workplace
    if (error.response.status === 404) {
      result.cqcStatusMatch = false;
    } else {
      result.cqcStatusMatch = true;
    }

    console.error('CQC API Error: ', error.message);
  }

  return res.status(200).send(result);
};

function checkRegistrationStatus(cqcRegistrationStatus) {
  if (cqcRegistrationStatus !== 'Registered') {
    return false;
  } else {
    return true;
  }
}

function checkPostcodeMatch(postcode, cqcPostcode) {
  if (!postcode) return true;

  if (postcode && cqcPostcode) {
    return postcode.toUpperCase() === cqcPostcode.toUpperCase() ? true : false;
  }
}

function checkMainServiceMatch(mainService, cqcServices) {
  if (!mainService) return true;

  if (mainService && cqcServices) {
    return cqcServices.find((service) => service.description === mainService).length > 0;
  }
}

router.route('/:locationID').get(
  cqcStatusCheck,
  celebrate({
    query: Joi.object().keys({
      locationID: Joi.string().required(),
      postcode: Joi.string(),
      mainService: Joi.string(),
    }),
  }),
);

router.use('/:locationID', errors());

module.exports = router;
module.exports.cqcStatusCheck = cqcStatusCheck;
