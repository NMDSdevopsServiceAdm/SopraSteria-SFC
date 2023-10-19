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
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
      },
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('cqcref.postcodes', 'uuid');
  },
};
