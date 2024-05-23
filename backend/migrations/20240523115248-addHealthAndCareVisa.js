'use strict';

const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          table,
          'HealthAndCareVisaValue',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No', "Don''t know"],
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'HealthAndCareVisaSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'HealthAndCareVisaChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'HealthAndCareVisaSavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'HealthAndCareVisaChangedBy',
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
        queryInterface.removeColumn(table, 'HealthAndCareVisaValue', { transaction }),
        queryInterface.removeColumn(table, 'HealthAndCareVisaSavedAt', { transaction }),
        queryInterface.removeColumn(table, 'HealthAndCareVisaChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'HealthAndCareVisaSavedBy', { transaction }),
        queryInterface.removeColumn(table, 'HealthAndCareVisaChangedBy', { transaction }),
      ]);
    });
  },
};
