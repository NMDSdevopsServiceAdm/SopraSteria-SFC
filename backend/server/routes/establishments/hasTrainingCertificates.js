const router = require('express').Router();
const models = require('../../models');

const workplaceOrSubHasTrainingCertificates = async (req, res) => {
  try {
    const workplacesWithTrainingCertificates = await models.establishment.getTrainingCertificatesForWorkplaceAndAnySubs(
      req.establishmentId,
    );

    const hasTrainingCertificates = workplacesWithTrainingCertificates.some((workplace) =>
      workplace.workers.some((worker) =>
        worker.workerTraining.some(
          (training) => training.trainingCertificates && training.trainingCertificates.length > 0,
        ),
      ),
    );

    return res.status(200).json({ hasTrainingCertificates });
  } catch (error) {
    return res.status(500).send('Failed to complete check for training certificates');
  }
};

router.route('/').get(workplaceOrSubHasTrainingCertificates);

module.exports = router;
module.exports.workplaceOrSubHasTrainingCertificates = workplaceOrSubHasTrainingCertificates;
