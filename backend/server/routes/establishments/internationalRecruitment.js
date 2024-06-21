const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');
const { hasPermission } = require('../../utils/security/hasPermission');

const getAllWorkersNationalityAndBritishCitizenship = async (req, res) => {
  const establishmentId = req.establishmentId;

  try {
    const allWorkers = await models.worker.getAllWorkersNationalityAndBritishCitizenship(establishmentId);

    const filteredWorkers = filterWorkersWhoRequireInternationalRecruitmentAnswers(allWorkers);

    res.status(200).send({
      workers: filteredWorkers.map((worker) => {
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
    return res.status(500).send('Failed to get total workers for workplace with id: ' + establishmentId);
  }
};

const getNoOfWorkersWhoRequireInternationalRecruitmentAnswers = async function (req, res) {
  const establishmentId = req.establishmentId;

  try {
    const allWorkers = await models.worker.getAllWorkersNationalityAndBritishCitizenship(establishmentId);
    const filteredWorkers = filterWorkersWhoRequireInternationalRecruitmentAnswers(allWorkers);

    return res.status(200).send({ noOfWorkersWhoRequireAnswers: filteredWorkers.length });
  } catch (err) {
    return res.status(500).send('Failed to get total workers for workplace with id: ' + establishmentId);
  }
};

const filterWorkersWhoRequireInternationalRecruitmentAnswers = (workers) => {
  return workers.filter(
    (worker) =>
      (worker.NationalityValue === 'Other' && ['No', "Don't know", null].includes(worker.BritishCitizenshipValue)) ||
      (worker.NationalityValue === "Don't know" && worker.BritishCitizenshipValue === 'No'),
  );
};

router.route('/').get(hasPermission('canViewWorker'), getAllWorkersNationalityAndBritishCitizenship);
router
  .route('/noOfWorkersWhoRequireInternationalRecruitmentAnswers')
  .get(hasPermission('canViewWorker'), getNoOfWorkersWhoRequireInternationalRecruitmentAnswers);

module.exports = router;
module.exports.getAllWorkersNationalityAndBritishCitizenship = getAllWorkersNationalityAndBritishCitizenship;
module.exports.getNoOfWorkersWhoRequireInternationalRecruitmentAnswers =
  getNoOfWorkersWhoRequireInternationalRecruitmentAnswers;
