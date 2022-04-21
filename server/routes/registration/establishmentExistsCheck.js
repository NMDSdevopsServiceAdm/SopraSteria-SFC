const router = require('express').Router({ mergerParams: true });
const models = require('../../models');
const pCodeCheck = require('../../utils/postcodeSanitizer');

const establishmentExistsCheck = async (req, res) => {
  const { locationID } = req.body;

  try {
    const result = await models.establishment.findByLocationID(locationID);

    res.status(200).json({ exists: !!result });
  } catch (error) {
    // console.error(error);
    res.status(500).json({
      message: 'There was a problem checking if the establishment already exists in the service',
    });
  }
};

const checkPostcodeAndNameExist = async (req, res) => {
  const { postcode, name: establishmentName } = req.body.postcodeAndName;

  try {
    const sanitisedPostcode = pCodeCheck.sanitisePostcode(postcode);
    const result = await models.establishment.findByPostcodeAndName(sanitisedPostcode, establishmentName);

    res.status(200).json({ exists: !!result });
  } catch (error) {
    // console.error(error);
    res.status(500).json({
      message: 'There was a problem checking if the establishment already exists in the service',
    });
  }
};

router.route('/locationId').post(establishmentExistsCheck);
router.route('/postcodeAndName').post(checkPostcodeAndNameExist);

module.exports = router;
module.exports.establishmentExistsCheck = establishmentExistsCheck;
module.exports.checkPostcodeAndNameExist = checkPostcodeAndNameExist;
