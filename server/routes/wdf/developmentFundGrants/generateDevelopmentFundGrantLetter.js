const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');
const { createAgreement, queryAgreementStatus } = require('./adobeSign');

const generateDevelopmentFundGrantLetter = async (req, res, next) => {
  try {
    const { establishmentId, name, email } = req.body;
    const { NameValue, address1, town, county, postcode, IsNationalOrg } = await models.establishment.getWDFClaimData(
      establishmentId,
    );
    // additional fields needed - funding_amount, grant_reference
    const { id: agreementId } = await createAgreement({
      name,
      email,
      organisation: NameValue,
      address: address1,
      town,
      county,
      postcode,
      isNationalOrg: IsNationalOrg,
    });
    // check sent date/time and signStatus
    const data = await queryAgreementStatus(agreementId);
    // save to DB
    await models.DevelopmentFundGrants.saveWDFData({
      agreementId,
      establishmentId,
      email,
      name,
      signStatus: data.status,
      createdDate: data.createdDate,
    });

    return res.status(201).json({ agreementId });
  } catch (err) {
    return next(Error('unable to create agreement'));
  }
};

router.route('/').post(generateDevelopmentFundGrantLetter);

module.exports = router;
module.exports.generateDevelopmentFundGrantLetter = generateDevelopmentFundGrantLetter;
