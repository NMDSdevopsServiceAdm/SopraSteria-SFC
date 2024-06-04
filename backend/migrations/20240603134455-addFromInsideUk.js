'use strict';

const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          table,
          'EmployedFromInsideUkValue',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No', "Don't know"],
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'EmployedFromInsideUkSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'EmployedFromInsideUkChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'EmployedFromInsideUkSavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'EmployedFromInsideUkChangedBy',
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
        queryInterface.removeColumn(table, 'EmployedFromInsideUkValue', { transaction }),
        queryInterface.removeColumn(table, 'EmployedFromInsideUkSavedAt', { transaction }),
        queryInterface.removeColumn(table, 'EmployedFromInsideUkChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'EmployedFromInsideUkSavedBy', { transaction }),
        queryInterface.removeColumn(table, 'EmployedFromInsideUkChangedBy', { transaction }),
      ]);
    });
  },
};
