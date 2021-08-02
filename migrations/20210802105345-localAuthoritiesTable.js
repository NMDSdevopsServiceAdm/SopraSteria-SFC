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
          EstablishmentIDFK: {
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'Establishment',
                schema: 'cqc',
              },
              key: 'EstablishemntID',
            },
          },
          LocalAuthorityName: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          LastYear: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          ThisYear: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          Status: {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Updated', 'Not Updated'],
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
