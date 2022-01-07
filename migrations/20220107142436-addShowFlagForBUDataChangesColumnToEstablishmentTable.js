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
          'ShowFlagForBUDataChange',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            defaultValue: false,
          },
          { transaction },
        ),
        await queryInterface.sequelize.query('UPDATE cqc."Establishment" SET "ShowFlagForBUDataChange" = true;', {
          transaction,
        }),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.query(
      'ALTER TABLE cqc."Establishment" DROP COLUMN IF EXISTS "ShowFlagForBUDataChange"; ',
    );
  },
};
