const express = require('express');
const { sequelize } = require('../../models');
const router = express.Router({ mergeParams: true });
const models = require('../../models');
const Authorization = require('../../utils/security/isAuthenticated');

const postStaffRecruitmentData = async (req, res) => {
  try {
    const { staffRecruitmentColumn, staffRecruitmentData } = req.body;

    await sequelize.transaction(async (t) => {
      await models.establishment.update(
        {
          [staffRecruitmentColumn]: staffRecruitmentData,
        },
        {
          where: {
            id: req.establishmentId,
          },
          transaction: t,
        },
      );
    });

    return res.status(200).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({});
  }
};

const getStaffRecruitmentData = async (req, res) => {
  try {
    const currentStaffRecruitmentData = await models.establishment.findOne({
      where: {
        id: req.establishmentId,
      },
      attributes: [
        'id',
        'PeopleInterviewedInTheLastFourWeeks',
        'MoneySpentOnAdvertisingInTheLastFourWeeks',
        'DoNewStartersRepeatMandatoryTrainingFromPreviousEmployment',
        'WouldYouAcceptCareCertificatesFromPreviousEmployment',
      ],
    });
    res.status(200);
    return res.json({
      peopleInterviewedInTheLastFourWeeks: currentStaffRecruitmentData.get('PeopleInterviewedInTheLastFourWeeks'),
      moneySpentOnAdvertisingInTheLastFourWeeks: currentStaffRecruitmentData.get(
        'MoneySpentOnAdvertisingInTheLastFourWeeks',
      ),
      doNewStartersRepeatMandatoryTrainingFromPreviousEmployment: currentStaffRecruitmentData.get(
        'DoNewStartersRepeatMandatoryTrainingFromPreviousEmployment',
      ),
      wouldYouAcceptCareCertificatesFromPreviousEmployment: currentStaffRecruitmentData.get(
        'WouldYouAcceptCareCertificatesFromPreviousEmployment',
      ),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({});
  }
};

router.route('/').post(Authorization.isAuthorised, postStaffRecruitmentData);
router.route('/').get(Authorization.isAuthorised, getStaffRecruitmentData);

module.exports = router;
module.exports.postStaffRecruitmentData = postStaffRecruitmentData;
module.exports.getStaffRecruitmentData = getStaffRecruitmentData;
