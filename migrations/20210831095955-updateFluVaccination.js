'use strict';

const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await Promise.all([
        queryInterface.renameColumn(table, 'FluJabValue', 'LastYearFluJabValue', { transaction }),
        queryInterface.renameColumn(table, 'FluJabSavedAt', 'LastYearFluJabSavedAt', { transaction }),
        queryInterface.renameColumn(table, 'FluJabChangedAt', 'LastYearFluJabChangedAt', { transaction }),
        queryInterface.renameColumn(table, 'FluJabSavedBy', 'LastYearFluJabSavedBy', { transaction }),
        queryInterface.renameColumn(table, 'FluJabChangedBy', 'LastYearFluJabChangedBy', { transaction }),
      ]);

      await Promise.all([
        queryInterface.sequelize.query(`ALTER TABLE cqc."Worker" ADD COLUMN "FluJabValue" cqc."enum_Worker_FluJabValue" DEFAULT NULL;`, { transaction }),
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
        }, { transaction }),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await Promise.all([
        queryInterface.removeColumn(table, 'FluJabValue', { transaction }),
        queryInterface.removeColumn(table, 'FluJabSavedAt', { transaction }),
        queryInterface.removeColumn(table, 'FluJabChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'FluJabSavedBy', { transaction }),
        queryInterface.removeColumn(table, 'FluJabChangedBy', { transaction }),
      ]);

      await Promise.all([
        queryInterface.renameColumn(table, 'LastYearFluJabValue', 'FluJabValue', { transaction }),
        queryInterface.renameColumn(table, 'LastYearFluJabSavedAt', 'FluJabSavedAt', { transaction }),
        queryInterface.renameColumn(table, 'LastYearFluJabChangedAt', 'FluJabChangedAt', { transaction }),
        queryInterface.renameColumn(table, 'LastYearFluJabSavedBy', 'FluJabSavedBy', { transaction }),
        queryInterface.renameColumn(table, 'LastYearFluJabChangedBy', 'FluJabChangedBy', { transaction }),
      ])
    });
  }
};

