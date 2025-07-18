'use strict';
const models = require('../server/models/index');

const servicesTable = {
  tableName: 'services',
  schema: 'cqc',
};
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(servicesTable, 'CanDoDelegatedHealthcareActivities', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(servicesTable, 'CanDoDelegatedHealthcareActivities');
  },
};
