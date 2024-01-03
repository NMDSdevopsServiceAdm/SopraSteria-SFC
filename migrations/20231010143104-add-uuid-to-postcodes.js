'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        await queryInterface.addColumn(
          {
            tableName: 'postcodes',
            schema: 'cqcref',
          },
          'uuid',
          {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            allowNull: false,
          },
          {
            transaction,
          },
        ),
      ]);
    });
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([await queryInterface.removeColumn(
          {
            tableName: 'postcodes',
            schema: 'cqcref',
          }
          , 'uuid',
          { transaction }
        )
      ]);
    });
  },
};
