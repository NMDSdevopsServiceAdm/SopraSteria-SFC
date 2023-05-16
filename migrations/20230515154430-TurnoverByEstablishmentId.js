'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const createTable = (queryInterface, tableName, column = null, transaction) => {
      return queryInterface.createTable(
        tableName,
        {
          EstablishmentFK: {
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
          'BenchmarksTurnoverByEstId',
          null,

          t,
        ),
        createTable(
          queryInterface,
          'BenchmarksTurnoverByEstIdGoodOutstanding',

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
            tableName: 'BenchmarksTurnoverByEstId',
            schema: 'cqc',
          },
          { transaction },
        ),
        queryInterface.dropTable(
          {
            tableName: 'BenchmarksTurnoverByEstIdGoodOutstanding',
            schema: 'cqc',
          },
          { transaction },
        ),
      ]);
    });
  },
};
