'use strict';
const router = require('express').Router();
const CQCDataAPI = require('../../utils/CQCDataAPI');

const cqcStatusCheck = async (req, res) => {
  const locationID = req.params.locationID;
  const postcode = req.query.postcode;

  const result = {};

  if (!locationID) {
    return res.status(500).send();
  }

  try {
    const workplaceCQCData = await CQCDataAPI.getWorkplaceCQCData(locationID);

    const cqcStatusMatch =
      checkRegistrationStatus(workplaceCQCData.registrationStatus) &&
      checkPostcodeMatch(postcode, workplaceCQCData.postalCode);

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
  if (postcode && cqcPostcode) {
    return postcode.toUpperCase() === cqcPostcode.toUpperCase() ? true : false;
  }
}

router.route('/:locationID').get(cqcStatusCheck);

module.exports = router;
module.exports.cqcStatusCheck = cqcStatusCheck;
