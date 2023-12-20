'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable(
        'LocalAuthorities',
        {
          ID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          EstablishmentFK: {
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'Establishment',
                schema: 'cqc',
              },
              key: 'EstablishmentID',
            },
          },
          LocalAuthorityName: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          LastYear: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          ThisYear: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          Status: {
            type: Sequelize.DataTypes.ENUM,
            defaultValue: 'Not Updated',
            values: ['Not Updated', 'Updated'],
          },
          Notes: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
        },
        { schema: 'cqc' },
      ),
    ]);
  },

  down: (queryInterface) => {
    return queryInterface.dropTable({
      tableName: 'LocalAuthorities',
      schema: 'cqc',
    });
  },
};
