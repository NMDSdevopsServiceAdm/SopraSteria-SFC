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
        createTable(queryInterface, 'BenchmarksTimeInRoleByLAAndService', null, t),
        createTable(
          queryInterface,
          'BenchmarksTimeInRoleByLAAndServiceGoodOutstanding',
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
            tableName: 'BenchmarksTimeInRoleByLAAndService',
            schema: 'cqc',
          },
          { transaction },
        ),
        queryInterface.dropTable(
          {
            tableName: 'BenchmarksTimeInRoleByLAAndServiceGoodOutstanding',
            schema: 'cqc',
          },
          { transaction },
        ),
      ]);
    });
  },
};
