'use strict';

const models = require('../server/models/index');

const jobs = [
  { id: 2, newTitle: 'Administrative', oldTitle: 'Administrative, office staff (non care-providing)' },
  { id: 11, newTitle: 'Community support and outreach work', oldTitle: 'Community, support and outreach work' },
  { id: 14, newTitle: 'Managers (care-related, but not care-providing roles)', oldTitle: 'Managers and staff (care-related, but not care-providing)' },
  { id: 1, newTitle: 'Activities worker, co-ordinator', oldTitle: 'Activities worker, coordinator' },
  { id: 8, newTitle: 'Care co-ordinator', oldTitle: 'Care coordinator' }
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
