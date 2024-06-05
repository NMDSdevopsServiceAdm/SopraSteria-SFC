'use strict';

const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          table,
          'EmployedFromOutsideUkValue',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No', "Don't know"],
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'EmployedFromOutsideUkSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'EmployedFromOutsideUkChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'EmployedFromOutsideUkSavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'EmployedFromOutsideUkChangedBy',
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
        queryInterface.removeColumn(table, 'EmployedFromOutsideUkValue', { transaction }),
        queryInterface.removeColumn(table, 'EmployedFromOutsideUkSavedAt', { transaction }),
        queryInterface.removeColumn(table, 'EmployedFromOutsideUkChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'EmployedFromOutsideUkSavedBy', { transaction }),
        queryInterface.removeColumn(table, 'EmployedFromOutsideUkChangedBy', { transaction }),
      ]);
    });
  },
};
