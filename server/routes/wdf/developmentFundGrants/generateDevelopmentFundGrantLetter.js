const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');
const DevelopmentFundGrants = require('../../../models/developmentFundGrants');
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
    const statusMap = {
      OUT_FOR_SIGNATURE: 'SENT',
      OUT_FOR_DELIVERY: 'SENT',
    };
    // save to DB - success then continue, else cancel
    await models.DevelopmentFundGrants.create({
      AgreementID: agreementId,
      EstablishmentID: establishmentId,
      ReceiverEmail: email,
      ReceiverName: name,
      SignStatus: statusMap[data.status],
      DateSent: data.createdDate,
    });

    return res.status(201).json({ agreementId });
  } catch (err) {
    return next(Error('unable to create agreement'));
  }
};

router.route('/').post(generateDevelopmentFundGrantLetter);

module.exports = router;
module.exports.generateDevelopmentFundGrantLetter = generateDevelopmentFundGrantLetter;
