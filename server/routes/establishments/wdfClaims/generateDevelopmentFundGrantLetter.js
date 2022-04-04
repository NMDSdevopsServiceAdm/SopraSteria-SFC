const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../../models');
const { createAgreement, queryAgreementStatus } = require('../../../utils/adobeSign');

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

const getDevelopmentFundGrantStatus = async (req, res, next) => {
  try {
    // get signStatus
    const getWDFClaimStatus = await models.DevelopmentFundGrants.getWDFClaimStatus(req.body.establishmentId);
    const data = await queryAgreementStatus(getWDFClaimStatus.AgreementID);

    const signedStatus = getWDFClaimStatus.signStatus;
    const echoSignStatus = data.status;
    const returnStatus = signedStatus == 'SIGNED' ? signedStatus : echoSignStatus;

    if (signedStatus != 'SIGNED') {
      // update status to DB
      if (signedStatus != echoSignStatus) {
        await models.DevelopmentFundGrants.updateStatus(req.body.establishmentId, echoSignStatus);
      }
    }
    return res.status(200).json({ Status: returnStatus });
  } catch (err) {
    console.error(err);
    return next(Error('unable to get the status'));
  }
};

router.route('/').get(getDevelopmentFundGrantStatus);
router.route('/').post(generateDevelopmentFundGrantLetter);

module.exports = router;
module.exports.generateDevelopmentFundGrantLetter = generateDevelopmentFundGrantLetter;
module.exports.getDevelopmentFundGrantStatus = getDevelopmentFundGrantStatus;
