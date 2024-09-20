'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const job of jobs) {
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
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
