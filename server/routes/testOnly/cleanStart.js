const express = require('express');
const router = express.Router({mergeParams: true});
const models = require('../../models');

// deletes all existing transactional data
router.route('/').post(async (req, res) => {
  try {
    await models.sequelize.transaction(async t => {
        // workers
        await models.workerAudit.destroy({
            where: {}
        });
        await models.workerJobs.destroy({
            where: {}
        });
        await models.worker.destroy({
            where: {}
        });
        
        // establishments
        await models.establishmentCapacity.destroy({
            where: {}
        });
        await models.establishmentJobs.destroy({
            where: {}
        });
        await models.establishmentLocalAuthority.destroy({
            where: {}
        });
        await models.establishmentServices.destroy({
            where: {}
        });

        // accounts
        await models.passwordTracking.destroy({
            where: {}
        });
        await models.userAudit.destroy({
            where: {}
        });

        // registration
        await models.login.destroy({
            where: {}
        });
        await models.user.destroy({
            where: {}
        });
        await models.establishment.destroy({
            where: {}
        });
    });

    return res.status(200).send('success');

  } catch (err) {
    console.error(err);
    return res.status(503).send('Failed');
  }
});

module.exports = router;