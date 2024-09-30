'use strict';
const models = require('../server/models/index');

const jobRoleGroups = {
  ['Care providing roles']: [25,10,11,20,39],
  ['Professional and related roles']: [27,18,23,4,19,17,16],
  ['Managerial and Supervisory roles']: [26,15,13,22,28,14,30,31,32],
  ['IT, digital and date roles']: [33,34,35,36,37,38],
  ['Other roles']: [12,3,2,5,21,1,24,7,8,6,31]
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      for(let key of Object.keys(jobRoleGroups)) {
        await models.job.update(
          {
            jobRoleGroup: key,
          },
          {
            where: {
              id: { [Sequelize.Op.in]: jobRoleGroups[key] }
            }
          },
          { transaction }
        );
      }
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.job.update(
        {
          jobRoleGroup: null,
        },
        {
          where: {
            jobRoleGroup: {
              [Sequelize.Op.ne]: null
            }
          }
        },
        { transaction }
      );
    });
  }
};
