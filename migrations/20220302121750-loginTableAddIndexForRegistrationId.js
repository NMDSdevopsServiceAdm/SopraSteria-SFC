'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query('DROP INDEX IF EXISTS cqc."login__registrations_i_d";', { transaction }),
        queryInterface.addIndex(
          {
            tableName: 'Login',
            schema: 'cqc',
          },
          {
            fields: ['RegistrationID'],
          },
        ),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      {
        tableName: 'Login',
        schema: 'cqc',
      },
      'cqc."login__registration_i_d"',
    );
  },
};
