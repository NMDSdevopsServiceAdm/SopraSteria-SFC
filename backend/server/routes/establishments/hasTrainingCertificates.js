const router = require('express').Router();
const models = require('../../models');

const workplaceOrSubHasTrainingCertificates = async (req, res) => {
  try {
    const hasTrainingCertificates = await models.establishment.workplaceOrSubHasAtLeastOneTrainingCertificate(
      req.establishmentId,
    );

    return res.status(200).json({ hasTrainingCertificates });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Failed to complete check for training certificates');
  }
};

router.route('/').get(workplaceOrSubHasTrainingCertificates);

module.exports = router;
module.exports.workplaceOrSubHasTrainingCertificates = workplaceOrSubHasTrainingCertificates;
