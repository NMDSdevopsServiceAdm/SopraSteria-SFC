const express = require('express');
const router = express.Router({ mergeParams: true });

//onst Workers = require('../../models/classes/worker');
const models = require('../../models');
const { hasPermission } = require('../../utils/security/hasPermission');

const getAllWorkersNationalityAndBritishCitizenship = async (req, res) => {
  const establishmentId = req.establishmentId;

  const where = {
    archived: false,
  };

  try {
    const allWorkers = await models.worker.getAllWorkersNationalityAndBritishCitizenship(establishmentId);

    res.status(200).send({
      workers: allWorkers.map((worker) => {
        return {
          uid: worker.uid,
          name: worker.NameOrIdValue,
          nationality: worker.NationalityValue,
          britishCitizenship: worker.BritishCitizenshipValue,
          healthAndCareVisa: worker.HealthAndCareVisaValue,
        };
      }),
    });
  } catch (err) {
    console.error('worker::GET:total - failed', err);
    return res.status(500).send('Failed to get total workers for establishment having id: ' + establishmentId);
  }
};

router.route('/').get(hasPermission('canViewWorker'), getAllWorkersNationalityAndBritishCitizenship);

module.exports = router;
module.exports.getAllWorkersNationalityAndBritishCitizenship = getAllWorkersNationalityAndBritishCitizenship;
