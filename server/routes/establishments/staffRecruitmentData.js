const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');
const { hasPermission } = require('../../utils/security/hasPermission');

const postStaffRecruitmentData = async (req, res) => {
  try {
    const { staffRecruitmentData } = req.body;

    let staffRecruitmentColumn;
    let data;

    if (Object.keys(staffRecruitmentData).includes('amountSpent')) {
      staffRecruitmentColumn = 'moneySpentOnAdvertisingInTheLastFourWeeks';
      data = staffRecruitmentData.amountSpent;
    } else if (Object.keys(staffRecruitmentData).includes('trainingRequired')) {
      staffRecruitmentColumn = 'doNewStartersRepeatMandatoryTrainingFromPreviousEmployment';
      data = staffRecruitmentData.trainingRequired;
    }

    await models.establishment.update(
      {
        [staffRecruitmentColumn]: data,
      },
      {
        where: {
          id: req.establishmentId,
        },
      },
    );

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

router.route('/').post(hasPermission('canEditEstablishment'), postStaffRecruitmentData);
router.route('/').get(hasPermission('canViewEstablishment'), getStaffRecruitmentData);

module.exports = router;
module.exports.postStaffRecruitmentData = postStaffRecruitmentData;
module.exports.getStaffRecruitmentData = getStaffRecruitmentData;
