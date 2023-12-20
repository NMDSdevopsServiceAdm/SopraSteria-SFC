'use strict';

const table = {
  tableName: 'NotificationsEstablishment',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'requestorEstUID', {
      type: Sequelize.DataTypes.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(table, 'requestorEstUID');
  },
};
