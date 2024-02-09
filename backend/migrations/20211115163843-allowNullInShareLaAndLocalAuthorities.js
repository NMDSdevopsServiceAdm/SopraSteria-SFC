'use strict';

const establishmentTable = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.changeColumn(
          establishmentTable,
          'ShareDataWithCQC',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.changeColumn(
          establishmentTable,
          'ShareDataWithLA',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.changeColumn(
          establishmentTable,
          'ShareDataWithCQC',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
          },
          { transaction },
        ),
        queryInterface.changeColumn(
          establishmentTable,
          'ShareDataWithLA',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
          },
          { transaction },
        ),
      ]);
    });
  },
};
