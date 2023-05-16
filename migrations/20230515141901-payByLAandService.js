'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const createTable = (queryInterface, tableName, column = null, transaction) => {
      return queryInterface.createTable(
        tableName,
        {
          MainJobRole: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: {
                tableName: 'Job',
                schema: 'cqc',
              },
              key: 'JobID',
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
          BaseEstablishments: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          BaseWorkers: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          AverageHourlyRate: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          AverageAnnualFTE: {
            type: Sequelize.DataTypes.INTEGER,
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
          'PayByLAAndService',
          null,

          t,
        ),
        createTable(
          queryInterface,
          'PayByLAAndServiceGoodOutstanding',

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
        queryInterface.dropTable({
          tableName: 'PayByLAAndService',
          schema: 'cqc',
        }),
        queryInterface.dropTable({
          tableName: 'PayByLAAndServiceGoodOutstanding',
          schema: 'cqc',
        }),
      ]);
    });
  },
};
