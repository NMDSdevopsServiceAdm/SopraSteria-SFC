'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'BenchmarksEstablishmentsAndWorkers',
      {
        LocalAuthorityArea: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
        },

        MainServiceFK: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: 'services',
              schema: 'cqc',
            },
            key: 'reportingID',
          },
        },
        BaseEstablishments: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
        },
        WorkerCount: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
        },
      },
      { schema: 'cqc' },
    );
  },

  down: (queryInterface) => {
    return queryInterface.dropTable({
      tableName: 'BenchmarksEstablishmentsAndWorkers',
      schema: 'cqc',
    });
  },
};
