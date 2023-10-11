'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the 'uuid' column
    await queryInterface.addColumn(
      {
        tableName: 'postcodes',
        schema: 'cqcref',
      },
      'uuid',
      {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'), // Postgres specific, use your database's equivalent
        allowNull: false,
      },
    );
  },

  down: async (queryInterface) => {
    // Remove the 'uuid' column
    await queryInterface.removeColumn('cqcref.postcodes', 'uuid');
  },
};
