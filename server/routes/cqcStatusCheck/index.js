'use strict';
const router = require('express').Router();
const axios = require('axios');

// CQC Endpoint
const url = 'https://api.cqc.org.uk/public/v1';

const cqcStatusCheck = async (req, res) => {
  const locationID = req.params.locationID;
  const result = {};

  if (!locationID) {
    return res.status(500).send();
  }

  try {
    const { data } = await axios.get(url + '/locations/' + locationID);

    const cqcStatusMatch = data.registrationStatus === 'Registered';

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

router.route('/:locationID').get(cqcStatusCheck);

module.exports = router;
module.exports.cqcStatusCheck = cqcStatusCheck;
