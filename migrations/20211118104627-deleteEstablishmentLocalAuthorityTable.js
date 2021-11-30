'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.dropTable({
      schema: 'cqc',
      tableName: 'EstablishmentLocalAuthority',
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.createTable(
      'EstablishmentLocalAuthority',
      {
        EstablishmentLocalAuthorityID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        EstablishmentID: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Establishment',
              schema: 'cqc',
            },
            key: 'EstablishmentID',
          },
        },
        CssrID: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        CssR: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      },
      {
        schema: 'cqc',
      },
    );
  },
};
