'use strict';
const models = require('../server/models/index');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.job.destroy({
        where: {
          id: [ 9, 29 ]
        }
      }, { transaction });
    });
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await models.job.restore({
        where: {
          id: [9, 29]
        },
      }, { transaction });
    })
  }
};