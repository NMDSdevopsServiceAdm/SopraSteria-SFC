'use strict';
const models = require('../server/models/index');

const servicesTable = {
  tableName: 'services',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   return queryInterface.addColumn(servicesTable, 'PayAndPensionsGroup', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
   return queryInterface.removeColumn(servicesTable, 'PayAndPensionsGroup');
  }
};
