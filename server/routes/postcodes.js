const express = require('express');
const router = express.Router();
const pCodeCheck = require('../utils/postcodeSanitizer');
const models = require('../models/index');

const transformAddresses = (results) => {
  return results.map((result) => createAddressObject(result.dataValues));
};

const createAddressObject = (data) => {
  const numberAndStreet = data.building_number
    ? `${data.building_number} ${data.street_description}`
    : data.street_description;
  const addressInfo = [data.sub_building_name, data.building_name, numberAndStreet];
  const filteredAddressInfo = addressInfo.filter((value) => {
    return value != '';
  });

  return {
    locationName: data.rm_organisation_name,
    addressLine1: filteredAddressInfo[0],
    addressLine2: filteredAddressInfo[1] ? filteredAddressInfo[1] : '',
    addressLine3: filteredAddressInfo[2] ? filteredAddressInfo[2] : '',
    townCity: data.post_town,
    county: data.county,
    postalCode: data.postcode,
  };
};

/* GET with Postcode parameter to find matching addresses */
const getAddressesWithPostcode = async (req, res) => {
  try {
    let postcodeData = [];
    const cleanPostcode = pCodeCheck.sanitisePostcode(req.params.postcode);

    if (cleanPostcode != null) {
      const results = await models.pcodedata.findAll({
        where: {
          postcode: cleanPostcode,
        },
        order: [['uprn', 'ASC']],
      });

      postcodeData = transformAddresses(results);
    } else {
      res.status(400);
      return res.send({
        success: 0,
        message: 'Invalid Postcode',
      });
    }

    if (postcodeData.length === 0) {
      res.status(404);
      return res.send({
        success: 0,
        message: 'No addresses found',
      });
    }

    res.status(200);
    return res.json({
      success: 1,
      message: 'Addresses Found',
      postcodedata: postcodeData,
    });
  } catch (err) {
    console.error('[GET] .../api/postcode/:postcode - failed: ', err);
    return res.status(500).send();
  }
};

router.route('/:postcode').get(getAddressesWithPostcode);

module.exports = router;
module.exports.getAddressesWithPostcode = getAddressesWithPostcode;
module.exports.createAddressObject = createAddressObject;
