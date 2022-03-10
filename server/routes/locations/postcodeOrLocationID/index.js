var express = require('express');
var router = express.Router();
const Authorization = require('../../../utils/security/isAuthenticated');
const pCodeCheck = require('../../../utils/postcodeSanitizer');
const getLocationsRoute = require('../locationID');
const getLocationsPCRoute = require('../postcode');

const getLocationsByPostcodeOrLocationID = async (req, res, matching) => {
  // this checks it's a postcode and sanitises it
  let sanitisedPostcode = pCodeCheck.sanitisePostcode(req.params.postcodeOrLocationID);

  if (sanitisedPostcode !== null) {
    return await getLocationsPCRoute.getLocationsByPostcode(req, res, matching, sanitisedPostcode);
  } else {
    return await getLocationsRoute.getLocations(req, res, matching, req.params.postcodeOrLocationID);
  }
};

// // GET Location API by postalCode
router.route('/:postcodeOrLocationID').get(async function (req, res) {
  await getLocationsByPostcodeOrLocationID(req, res, false);
});

router.get('/matching/:postcodeOrLocationID', Authorization.isAuthorised);
// // GET Location API by postalCode
router.route('/matching/:postcodeOrLocationID').get(async function (req, res) {
  await getLocationsByPostcodeOrLocationID(req, res, true);
});

module.exports = router;
module.exports.getLocationsByPostcodeOrLocationID = getLocationsByPostcodeOrLocationID;
