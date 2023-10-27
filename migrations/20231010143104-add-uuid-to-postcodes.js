'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('cqcref.postcodes', 'uuid');
  },
};
