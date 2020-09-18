const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../../models');

// deletes all existing transactional data
router.route('/').post(async (req, res) => {
  try {
    await models.sequelize.transaction(async (t) => {
      // workers
      await models.workerAudit.destroy(
        {
          where: {},
        },
        { transaction: t },
      );
      await models.workerJobs.destroy(
        {
          where: {},
        },
        { transaction: t },
      );
      await models.worker.destroy(
        {
          where: {},
        },
        { transaction: t },
      );

      // establishments
      await models.establishmentCapacity.destroy(
        {
          where: {},
        },
        { transaction: t },
      );
      await models.establishmentJobs.destroy(
        {
          where: {},
        },
        { transaction: t },
      );
      await models.establishmentLocalAuthority.destroy(
        {
          where: {},
        },
        { transaction: t },
      );
      await models.establishmentServices.destroy(
        {
          where: {},
        },
        { transaction: t },
      );

      // accounts
      await models.addUserTracking.destroy(
        {
          where: {},
        },
        { transaction: t },
      );
      await models.passwordTracking.destroy(
        {
          where: {},
        },
        { transaction: t },
      );
      await models.userAudit.destroy(
        {
          where: {},
        },
        { transaction: t },
      );

      // registration
      await models.login.destroy(
        {
          where: {},
        },
        { transaction: t },
      );
      await models.user.destroy(
        {
          where: {},
        },
        { transaction: t },
      );
      await models.establishment.destroy(
        {
          where: {},
        },
        { transaction: t },
      );
    });

    return res.status(200).send('success');
  } catch (err) {
    console.error(err);
    return res.status(503).send('Failed');
  }
});

module.exports = router;
