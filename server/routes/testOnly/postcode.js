const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');

// returns a random set of addresses from the postcode dataset
//  if passing the limit parameter can vary the set size (defaults to 100)
router.route('/random').get(async (req, res) => {
  const setSize = req.sanitize(req.query.limit) ? req.sanitize(req.query.limit) : 100;

  try {
    let results = await models.pcodedata.findAll({
      order: [models.sequelize.random()],
      where: {
        local_custodian_code: [119, 121, 235, 350, 2741, 2830, 4210, 4520, 4525, 5150, 5450, 5870, 5900],
        postcode: {
          [models.Sequelize.Op.ne]: '',
        },
      },
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
      uprn: thisAddress.uprn,
      address1: concatenateAddress(
        thisAddress.sub_building_name,
        thisAddress.building_name,
        thisAddress.building_number,
        thisAddress.street_description,
      ),
      townAndCity: thisAddress.post_town,
      county: thisAddress.county,
      postcode: thisAddress.postcode,
      localCustodianCode: thisAddress.local_custodian_code,
    }),
  );

  return {
    postcodes: theseAddresses,
  };
};

const concatenateAddress = (subName, name, bNumber, street) => {
  let theAddress = '';

  if (subName) {
    theAddress += subName + ' ';
  }

  if (name) {
    theAddress += name + ' ';
  }

  if (bNumber) {
    theAddress += bNumber + ' ';
  }

  if (street) {
    theAddress += street + ' ';
  }

  return theAddress;
};

module.exports = router;
