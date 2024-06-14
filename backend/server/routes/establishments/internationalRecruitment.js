const express = require('express');
const router = express.Router({ mergeParams: true });

//onst Workers = require('../../models/classes/worker');
const models = require('../../models');
const { hasPermission } = require('../../utils/security/hasPermission');

const getAllWorkersNationalityAndBritishCitizenship = async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    const allWorkers = await models.worker.getAllWorkersNationalityAndBritishCitizenship(establishmentId);

    const filterWorkers = allWorkers.filter(
      (worker) =>
        (worker.NationalityValue === 'Other' && ['No', "Don't know", null].includes(worker.BritishCitizenshipValue)) ||
        (worker.NationalityValue === "Don't know" && worker.BritishCitizenshipValue === 'No'),
    );

    res.status(200).send({
      workers: filterWorkers.map((worker) => {
        return {
          uid: worker.uid,
          name: worker.NameOrIdValue,
          nationality: worker.NationalityValue,
          britishCitizenship: worker.BritishCitizenshipValue,
          healthAndCareVisa: worker.HealthAndCareVisaValue,
          employedFromOutsideUk: worker.EmployedFromOutsideUkValue,
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
