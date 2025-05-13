'use strict';

const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          table,
          'CareWorkforcePathwayRoleCategoryFK',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: {
                tableName: 'CareWorkforcePathwayRoleCategories',
                schema: 'cqc',
              },
              key: 'ID',
            },
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CareWorkforcePathwayRoleCategorySavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CareWorkforcePathwayRoleCategoryChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CareWorkforcePathwayRoleCategorySavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CareWorkforcePathwayRoleCategoryChangedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'CareWorkforcePathwayRoleCategoryFK', { transaction }),
        queryInterface.removeColumn(table, 'CareWorkforcePathwayRoleCategorySavedAt', { transaction }),
        queryInterface.removeColumn(table, 'CareWorkforcePathwayRoleCategoryChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'CareWorkforcePathwayRoleCategorySavedBy', { transaction }),
        queryInterface.removeColumn(table, 'CareWorkforcePathwayRoleCategoryChangedBy', { transaction }),
      ]);
    });
  },
};
