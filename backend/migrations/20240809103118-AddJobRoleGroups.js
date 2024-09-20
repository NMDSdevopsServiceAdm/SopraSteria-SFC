'use strict';

const table = { tableName: 'Job', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      queryInterface.addColumn(table, 'JobRoleGroup', {
        type: Sequelize.DataTypes.ENUM,
        values: [
          'Care providing roles',
          'Professional and related roles',
          'Managerial and Supervisory roles',
          'IT, digital and date roles',
          'Other roles',
        ],
        transaction
      });
    })
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      queryInterface.removeColumn(table, 'JobRoleGroup', {transaction});
    })
  }
};
