'use strict';

const table = { tableName: 'User', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          table,
          'CanManageWdfClaimsValue',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CanManageWdfClaimsSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CanManageWdfClaimsChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CanManageWdfClaimsSavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CanManageWdfClaimsChangedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'CanManageWdfClaimsValue', { transaction }),
        queryInterface.removeColumn(table, 'CanManageWdfClaimsSavedAt', { transaction }),
        queryInterface.removeColumn(table, 'CanManageWdfClaimsChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'CanManageWdfClaimsSavedBy', { transaction }),
        queryInterface.removeColumn(table, 'CanManageWdfClaimsChangedBy', { transaction }),
      ]);
    });
  },
};
