'use strict';

const table = {
  tableName: 'User',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(table, 'ForgotUsernameAttempts', { type: Sequelize.DataTypes.INTEGER });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.removeColumn(table, 'ForgotUsernameAttempts');
  },
};
