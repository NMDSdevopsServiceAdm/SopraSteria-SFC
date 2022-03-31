const router = require('express').Router();
const { queryAgreementStatus } = require('./adobeSign');

const GenerateDevelopmentFundGrantLetter = require('./generateDevelopmentFundGrantLetter');

router.use('/agreements', GenerateDevelopmentFundGrantLetter);

router.get('/agreements/:agreementId', async (req, res, next) => {
  const { agreementId } = req.params;
  try {
    const agreementStatus = await queryAgreementStatus(agreementId);

    // store update status in db

    return res.json(agreementStatus);
  } catch (err) {
    return next(Error(`unable to query agreement with ID ${agreementId}`));
  }
});

module.exports = router;
