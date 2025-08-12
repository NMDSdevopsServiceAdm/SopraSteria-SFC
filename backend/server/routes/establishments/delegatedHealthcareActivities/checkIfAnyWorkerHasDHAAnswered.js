const models = require('../../../models');

const checkIfAnyWorkerHasDHAAnswered = async (req, res) => {
  const establishmentId = req.establishmentId;
  try {
    const hasAnswer = await models.worker.checkIfAnyWorkerHasDHAAnswered(establishmentId);

    res.status(200).send({ hasAnswer });
  } catch (err) {
    console.error('GET /delegatedHealthcareActivities/checkIfAnyWorkerHasDHAAnswered - failed', err);
    return res.status(500).send('Failed to query worker data for workplace with id: ' + establishmentId);
  }
};

module.exports = { checkIfAnyWorkerHasDHAAnswered };
