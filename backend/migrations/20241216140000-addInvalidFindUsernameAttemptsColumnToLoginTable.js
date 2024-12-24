'use strict';

const table = {
  tableName: 'Login',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(table, 'InvalidFindUsernameAttempts', { type: Sequelize.DataTypes.INTEGER });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(table, 'InvalidFindUsernameAttempts');
  },
};
