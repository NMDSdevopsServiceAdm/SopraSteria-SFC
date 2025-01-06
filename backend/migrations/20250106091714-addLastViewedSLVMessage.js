'use strict';

const loginTable = { tableName: 'Login', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(loginTable, 'LastViewedSLVMessage', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(loginTable, 'LastViewedSLVMessage');
  },
};
