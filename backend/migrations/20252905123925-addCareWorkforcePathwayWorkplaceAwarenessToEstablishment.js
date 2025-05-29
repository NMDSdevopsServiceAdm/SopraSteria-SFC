'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          table,
          'CareWorkforcePathwayWorkplaceAwarenessFK',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: {
                tableName: 'CareWorkforcePathwayWorkplaceAwareness',
                schema: 'cqc',
              },
              key: 'ID',
            },
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CareWorkforcePathwayWorkplaceAwarenessSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CareWorkforcePathwayWorkplaceAwarenessChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CareWorkforcePathwayWorkplaceAwarenessSavedBy',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CareWorkforcePathwayWorkplaceAwarenessChangedBy',
          {
            type: Sequelize.DataTypes.DATE,
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
        queryInterface.removeColumn(table, 'CareWorkforcePathwayWorkplaceAwarenessFK', { transaction }),
        queryInterface.removeColumn(table, 'CareWorkforcePathwayWorkplaceAwarenessSavedAt', { transaction }),
        queryInterface.removeColumn(table, 'CareWorkforcePathwayWorkplaceAwarenessChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'CareWorkforcePathwayWorkplaceAwarenessSavedBy', { transaction }),
        queryInterface.removeColumn(table, 'CareWorkforcePathwayWorkplaceAwarenessChangedBy', { transaction }),
      ]);
    });
  },
};
