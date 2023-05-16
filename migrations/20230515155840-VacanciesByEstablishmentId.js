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
          Vacancies: {
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
          VacancyRate: {
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
          'VacanciesByEstablishmentId',
          null,

          t,
        ),
        createTable(
          queryInterface,
          'VacanciesByEstablishmentIdGoodOutstanding',

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
          tableName: 'VacanciesByEstablishmentId',
          schema: 'cqc',
        }),
        queryInterface.dropTable({
          tableName: 'VacanciesByEstablishmentIdGoodOutstanding',
          schema: 'cqc',
        }),
      ]);
    });
  },
};
