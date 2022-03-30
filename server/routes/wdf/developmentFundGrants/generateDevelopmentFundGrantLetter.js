const models = require('../../../models');
const { createAgreement } = require('./adobeSign');

const generateDevelopmentFundGrantLetter = async (req, res, next) => {
  try {
    const { establishmentId, name, email } = req.body;
    const { NameValue, address1, town, county, postcode, IsNationalOrg } = await models.establishment.getWDFClaimData(
      establishmentId,
    );
    // additional fields needed - funding_amount, grant_reference
    const { id } = await createAgreement({
      name,
      email,
      organisation: NameValue,
      address: address1,
      town,
      county,
      postcode,
      isNationalOrg: IsNationalOrg,
    });
    // save to DB - success then continue, else cancel

    return res.status(201).json({ id });
  } catch (err) {
    return next(Error('unable to create agreement'));
  }
};

module.exports.generateDevelopmentFundGrantLetter = generateDevelopmentFundGrantLetter;
