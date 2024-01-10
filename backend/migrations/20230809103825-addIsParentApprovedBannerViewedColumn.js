'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'IsParentApprovedBannerViewed', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(table, 'IsParentApprovedBannerViewed');
  },
};
