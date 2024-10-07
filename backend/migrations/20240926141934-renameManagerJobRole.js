'use strict';

const models = require('../server/models/index');

const jobs = [
  { id: 14, newTitle: 'Manager (care-related, but not care-providing)', oldTitle: 'Managers and staff (care-related, but not care-providing)' },
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for (const job of jobs) {
        await models.job.update(
          {
            title: job.newTitle
          },
          {
            where: {
              id: job.id,
            },
            transaction,
          },
        );
      }
    });
  },

  async down (queryInterface, Sequelize) {
   return queryInterface.sequelize.transaction(async (transaction) => {
      for (const job of jobs) {
        await models.job.update(
          {
            title: job.oldTitle
          },
          {
            where: {
              id: job.id,
            },
            transaction,
          },
        );
      }
    });
  }
};
