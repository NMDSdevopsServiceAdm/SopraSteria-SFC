'use strict';

const locationTable = { tableName: 'location', schema: 'cqcref' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(locationTable, 'providerid', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(locationTable, 'providerid');
  },
};
