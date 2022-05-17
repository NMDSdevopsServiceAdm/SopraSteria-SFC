'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'BenchmarksViewed',
      {
        ID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        EstablishmentID: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: 'Establishment',
              schema: 'cqc',
            },
            key: 'EstablishmentID',
          },
        },
        ViewedTime: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
        },
      },
      { schema: 'cqc' },
    );
  },

  down: (queryInterface) => {
    return queryInterface.dropTable({
      tableName: 'BenchmarksViewed',
      schema: 'cqc',
    });
  },
};
