'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      return Promise.all([
        await queryInterface.addColumn(
          table,
          'DataChangesLastUpdated',
          {
            type: Sequelize.DataTypes.DATE,
          },
          { transaction },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.query(
      'ALTER TABLE cqc."Establishment" DROP COLUMN IF EXISTS "DataChangesLastUpdated"; ',
    );
  },
};
