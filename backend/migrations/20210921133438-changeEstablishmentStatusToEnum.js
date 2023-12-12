'use strict';

const establishmentTable = {
  tableName: 'Establishment',
  schema: 'cqc'
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await Promise.all([
        queryInterface.sequelize.query('DROP TYPE IF EXISTS cqc."enum_Establishment_Status";', { transaction }),
        queryInterface.sequelize.query(`CREATE TYPE cqc."enum_Establishment_Status" AS ENUM('PENDING', 'IN PROGRESS', 'REJECTED')`, { transaction }),
        queryInterface.changeColumn(
          establishmentTable,
          'Status', {
            type: 'cqc."enum_Establishment_Status" USING CAST("Status" as cqc."enum_Establishment_Status")',
          }, { transaction })
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async transaction => {
      await Promise.all([
        queryInterface.changeColumn(
          establishmentTable,
          'Status', {
            type: Sequelize.DataTypes.TEXT,
          }
        , { transaction }),
        queryInterface.sequelize.query('DROP TYPE IF EXISTS cqc."enum_Establishment_Status"', { transaction }),
      ]);
    });
  }
};
