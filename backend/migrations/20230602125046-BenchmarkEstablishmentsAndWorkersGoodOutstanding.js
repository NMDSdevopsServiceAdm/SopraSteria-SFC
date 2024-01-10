'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'BenchmarksEstablishmentsAndWorkersGoodOutstanding',
      {
        LocalAuthorityArea: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
        },
        MainServiceFK: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
        },
        CQCGoodOutstandingRating: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
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
      tableName: 'BenchmarksEstablishmentsAndWorkersGoodOutstanding',
      schema: 'cqc',
    });
  },
};
