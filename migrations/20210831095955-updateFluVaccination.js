'use strict';

const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.renameColumn(table, 'FluJabValue', 'LastYearFluJabValue', { transaction });
      await queryInterface.renameColumn(table, 'FluJabSavedAt', 'LastYearFluJabSavedAt', { transaction });
      await queryInterface.renameColumn(table, 'FluJabChangedAt', 'LastYearFluJabChangedAt', { transaction });
      await queryInterface.renameColumn(table, 'FluJabSavedBy', 'LastYearFluJabSavedBy', { transaction });
      await queryInterface.renameColumn(table, 'FluJabChangedBy', 'LastYearFluJabChangedBy', { transaction });

      await queryInterface.sequelize.query(`ALTER TABLE cqc."Worker" ADD COLUMN "FluJabValue" cqc."enum_Worker_FluJabValue" DEFAULT NULL;`, { transaction });
      await queryInterface.addColumn(table, 'FluJabSavedAt', {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      }, { transaction });
      await queryInterface.addColumn(table, 'FluJabChangedAt', {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      }, { transaction });
      await queryInterface.addColumn(table, 'FluJabSavedBy', {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      }, { transaction })
      await queryInterface.addColumn(table, 'FluJabChangedBy', {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      }, { transaction });
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn(table, 'FluJabValue', { transaction });
      await queryInterface.removeColumn(table, 'FluJabSavedAt', { transaction });
      await queryInterface.removeColumn(table, 'FluJabChangedAt', { transaction });
      await queryInterface.removeColumn(table, 'FluJabSavedBy', { transaction });
      await queryInterface.removeColumn(table, 'FluJabChangedBy', { transaction });

      await queryInterface.renameColumn(table, 'LastYearFluJabValue', 'FluJabValue', { transaction });
      await queryInterface.renameColumn(table, 'LastYearFluJabSavedAt', 'FluJabSavedAt', { transaction });
      await queryInterface.renameColumn(table, 'LastYearFluJabChangedAt', 'FluJabChangedAt', { transaction });
      await queryInterface.renameColumn(table, 'LastYearFluJabSavedBy', 'FluJabSavedBy', { transaction });
      await queryInterface.renameColumn(table, 'LastYearFluJabChangedBy', 'FluJabChangedBy', { transaction });
    });
  }
};

