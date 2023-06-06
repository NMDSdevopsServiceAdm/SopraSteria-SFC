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
          },
          BaseEstablishments: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          BaseWorkers: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          InRoleFor12MonthsCount: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          NotInRoleFor12MonthsCount: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          InRoleFor12MonthsPercentage: {
            type: Sequelize.DataTypes.DECIMAL(11, 10),
            allowNull: false,
          },
          ...column,
        },
        {
          schema: 'cqc',
          transaction,
        },
      );
    };

    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        createTable(queryInterface, 'BenchmarksTimeInRoleByEstId', null, t),
        createTable(
          queryInterface,
          'BenchmarksTimeInRoleByEstIdGoodOutstanding',
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
            tableName: 'BenchmarksTimeInRoleByEstId',
            schema: 'cqc',
          },
          { transaction },
        ),
        queryInterface.dropTable(
          {
            tableName: 'BenchmarksTimeInRoleByEstIdGoodOutstanding',
            schema: 'cqc',
          },
          { transaction },
        ),
      ]);
    });
  },
};
