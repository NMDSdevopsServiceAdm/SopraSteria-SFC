'use strict';
const router = require('express').Router(); //
const axios = require('axios');

// CQC Endpoint
const url = 'https://api.cqc.org.uk/public/v1';

const cqcStatusCheck = async (req, res) => {
  const locationID = req.params.locationID;
  const postcode = req.query.postcode.toUpperCase();
  const mainService = req.query.mainService.toUpperCase();

  const result = {};

  if (!locationID) {
    return res.status(500).send();
  }

  try {
    const { data } = await axios.get(url + '/locations/' + locationID);

    const cqcStatusMatch =
      checkRegistrationStatus(data.registrationStatus) &&
      checkPostcodeMatch(postcode, data.postalCode.toUpperCase()) &&
      checkMainServiceMatch(mainService, data.mainService);

    result.cqcStatusMatch = cqcStatusMatch;
  } catch (error) {
    // If the CQC API responds with a 404, we treat that as a successful not-registered call
    if (error.response.status === 404) {
      result.cqcStatusMatch = false;
    } else {
      result.cqcStatusMatch = true;
    }
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
  if (postcode !== cqcPostcode) {
    return false;
  } else {
    return true;
  }
}

function checkMainServiceMatch(mainService, cqcMainService) {
  if (mainService !== cqcMainService) {
    return false;
  } else {
    return true;
  }
}

router.route('/:locationID').get(cqcStatusCheck);

module.exports = router;
module.exports.cqcStatusCheck = cqcStatusCheck;
