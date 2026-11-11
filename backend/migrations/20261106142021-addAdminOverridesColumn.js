'use strict';

const workerTable = {
  tableName: 'Worker',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(workerTable, 'AdminOverrides', {
      type: Sequelize.DataTypes.JSONB,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(workerTable, 'AdminOverrides');
  },
};
