const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');

// returns a random set of addresses from the location dataset
//  if passing the limit parameter can vary the set size (defaults to 100)
router.route('/random').get(async (req, res) => {
  const setSize = req.sanitize(req.query.limit) ? req.sanitize(req.query.limit) : 10;

  try {
    let results = await models.location.findAll({
      order: [models.sequelize.random()],
      limit: setSize,
    });

    if (results && Array.isArray(results) && results.length > 0) {
      res.status(200);
      return res.json(formatAddressResponse(results));
    } else {
      return res.status(404).send('Not found');
    }
  } catch (err) {
    return res.status(503).send('Failed');
  }
});

const formatAddressResponse = (addresses) => {
  let theseAddresses = [];

  addresses.forEach((thisAddress) =>
    theseAddresses.push({
      address1: thisAddress.addressline1,
      address2: thisAddress.addressline2,
      townAndCity: thisAddress.towncity,
      county: thisAddress.county,
      postcode: thisAddress.postalcode,
      mainServiceName: thisAddress.mainservice,
      locatioName: thisAddress.locationname,
      locationId: thisAddress.locationid,
    }),
  );

  return {
    locations: theseAddresses,
  };
};

module.exports = router;
