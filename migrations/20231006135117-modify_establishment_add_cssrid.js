'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          {
            tableName: 'Establishment',
            schema: 'cqc',
          },
          'CssrID',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            primaryKey: true,
          },
          {
            transaction,
          },
        ),
      ]);
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.removeColumn(
          {
            tableName: 'Establishment',
            schema: 'cqc',
          },
          'CssrID',
          {
            transaction,
          },
        ),
      ]);
    });
  },
};
