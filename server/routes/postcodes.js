const express = require('express');
const router = express.Router();
const pCodeCheck = require('../utils/postcodeSanitizer');
const models = require('../models/index');
const getCssrRecordsFromPostcode = require('../services/cssr-records/cssr-record').getCssrRecordsFromPostcode;

const transformAddresses = (results) => {
  return results
    .filter((result) => result.theAuthority != null)
    .map((result) => createAddressObject(result.dataValues));
};

const transformGetAddressAPIResults = (results) => {
  return results.map((result) => createAddressObjectFromGetAddressesAPIResults(result, results.postcode));
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

const createAddressObjectFromGetAddressesAPIResults = (data, postcode) => {
  console.log(data);
  const numberAndStreet = data.buildingNumber ? `${data.buildingNumber} ${data.thoroughfare}` : data.thoroughfare;
  const addressInfo = [data.subBuildingName, data.buildingName, numberAndStreet];
  const filteredAddressInfo = addressInfo.filter((value) => {
    return value != '';
  });

  return {
    locationName: data.subBuildingName,
    addressLine1: filteredAddressInfo[0],
    addressLine2: filteredAddressInfo[1] ? filteredAddressInfo[1] : '',
    addressLine3: filteredAddressInfo[2] ? filteredAddressInfo[2] : '',
    townCity: data.townOrCity,
    county: data.county,
    postalCode: postcode,
  };
};

/* GET with Postcode parameter to find matching addresses
TODO fuzzy loop required here
look in pcodedata for record with matching la
if none found look in postcodes
if not full record found do getAdddressAPI and store result
*/
const getAddressesWithPostcode = async (req, res) => {
  try {
    let postcodeData = [];
    const cleanPostcode = pCodeCheck.sanitisePostcode(req.params.postcode);

    if (cleanPostcode == null) {
      res.status(400);
      return res.send({
        success: 0,
        message: 'Invalid Postcode',
      });
    }

    // Now try to get records with matching with Cssr on LAcode
    // This means we can associate a CssrID to the establishment
    const results = await getCssrRecordsFromPostcode(cleanPostcode);

    //filter out any results without a linked cssr record (theAuthority)
    //then transform addresses
    postcodeData = transformAddresses(results);

    if (postcodeData.length === 0) {
      const addressAPIResults = await models.postcodes.firstOrCreate(cleanPostcode);

      if (addressAPIResults == null) {
        res.status(404);
        return res.send({
          success: 0,
          message: 'No Response From getAddressAPI',
        });
      }
      postcodeData = transformGetAddressAPIResults(addressAPIResults);

      if (postcodeData.length === 0) {
        res.status(404);
        return res.send({
          success: 0,
          message: 'No addresses found',
        });
      }
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
