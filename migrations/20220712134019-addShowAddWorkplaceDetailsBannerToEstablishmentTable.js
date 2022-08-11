'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          table,
          'ShowAddWorkplaceDetailsBanner',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: true,
          },
          { transaction },
        ),
        await queryInterface.sequelize.query(
          'UPDATE cqc."Establishment" SET "ShowAddWorkplaceDetailsBanner" = false WHERE "EmployerTypeValue" IS NOT NULL;',
          {
            transaction,
          },
        ),
      ]);
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(table, 'ShowAddWorkplaceDetailsBanner');
  },
};
