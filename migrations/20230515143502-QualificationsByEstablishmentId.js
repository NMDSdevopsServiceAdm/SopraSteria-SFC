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
          DayssickAdjustedFixedAmount: {
            type: Sequelize.DataTypes.DECIMAL(11, 10),
            allowNull: false,
          },
          DayssickAdjustedMultiplication: {
            type: Sequelize.DataTypes.DECIMAL(11, 10),
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
          CountHasSCQual: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          CountNoSCQual: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          Qualifications: {
            type: Sequelize.DataTypes.DECIMAL(11, 10),
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
          'QualificationsByEstablishmentId',
          null,

          t,
        ),
        createTable(
          queryInterface,
          'QualificationsByEstablishmentIdGoodOutstanding',

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
          tableName: 'QualificationsByEstablishmentId',
          schema: 'cqc',
        }),
        queryInterface.dropTable({
          tableName: 'QualificationsByEstablishmentIdGoodOutstanding',
          schema: 'cqc',
        }),
      ]);
    });
  },
};
