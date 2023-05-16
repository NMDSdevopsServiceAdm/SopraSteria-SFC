'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const createTable = (queryInterface, tableName, column = null, transaction) => {
      return queryInterface.createTable(
        tableName,
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
          ...column,
          Employees: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          Leavers: {
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
          TurnoverRate: {
            type: Sequelize.DataTypes.DECIMAL(5, 2),
            allowNull: false,
          },
        },
        {
          schema: 'cqc',
          transaction,
        },
      );
    };

    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        createTable(
          queryInterface,
          'BenchmarksTurnoverByLAAndService',
          null,

          t,
        ),
        createTable(
          queryInterface,
          'BenchmarksTurnoverByLAAndServiceGoodOutstanding',

          {
            CQCGoodOutstandingRating: {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: false,
            },
          },

          t,
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.dropTable(
          {
            tableName: 'BenchmarksTurnoverByLAAndService',
            schema: 'cqc',
          },
          { transaction },
        ),
        queryInterface.dropTable(
          {
            tableName: 'BenchmarksTurnoverByLAAndServiceGoodOutstanding',
            schema: 'cqc',
          },
          { transaction },
        ),
      ]);
    });
  },
};
