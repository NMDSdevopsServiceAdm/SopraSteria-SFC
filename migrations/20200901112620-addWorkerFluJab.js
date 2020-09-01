'use strict';

const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(transaction => {
      return Promise.all([
        queryInterface.addColumn(table, 'FluJabValue', {
          type: Sequelize.DataTypes.ENUM,
          allowNull: true,
          values: ['Yes', 'No', "Don''t know"]
        }, { transaction }),
        queryInterface.addColumn(table, 'FluJabSavedAt', {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
        }, { transaction }),
        queryInterface.addColumn(table, 'FluJabChangedAt', {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
        }, { transaction }),
        queryInterface.addColumn(table, 'FluJabSavedBy', {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        }, { transaction }),
        queryInterface.addColumn(table, 'FluJabChangedBy', {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        }, { transaction })
      ])
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(transaction => {
      return Promise.all([
        queryInterface.removeColumn(table, 'FluJabValue', { transaction }),
        queryInterface.removeColumn(table, 'FluJabSavedAt', { transaction }),
        queryInterface.removeColumn(table, 'FluJabChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'FluJabSavedBy', { transaction }),
        queryInterface.removeColumn(table, 'FluJabChangedBy', { transaction })
      ]);
    });
  }
};
