'use strict';

const table = {
  tableName: 'LocalAuthorities',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').then(() => {
      return queryInterface.addColumn(table, 'LocalAuthorityUID', {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        unique: true,
      });
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn(table, 'LocalAuthorityUID');
  },
};
