'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.job.update(
        {
          jobRoleGroup: 'Managerial and supervisory roles'
        },
        {
          where: {
            jobRoleGroup: 'Managerial and Supervisory roles'
          },
          transaction,
        },
      );
    });
  },

  async down (queryInterface, Sequelize) {
return queryInterface.sequelize.transaction(async (transaction) => {
      await models.job.update(
        {
          jobRoleGroup: 'Managerial and Supervisory roles'
        },
        {
          where: {
            jobRoleGroup: 'Managerial and supervisory roles'
          },
          transaction,
        },
      );
    });
  }
};
