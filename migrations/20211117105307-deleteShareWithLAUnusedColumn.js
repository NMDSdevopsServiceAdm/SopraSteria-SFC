'use strict';

const establishmentTable = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.removeColumn(establishmentTable, 'ShareWithLASavedAt', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'ShareWithLAChangedAt', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'ShareWithLASavedBy', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'ShareWithLAChangedBy', { transaction }),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          establishmentTable,
          'ShareWithLASavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          establishmentTable,
          'ShareWithLAChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          establishmentTable,
          'ShareWithLASavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          establishmentTable,
          'ShareWithLAChangedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },
};
