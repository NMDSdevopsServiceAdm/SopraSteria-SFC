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

router.route('/').post(Authorization.isAuthorised, postStaffRecruitmentData);

module.exports = router;
module.exports.postStaffRecruitmentData = postStaffRecruitmentData;
