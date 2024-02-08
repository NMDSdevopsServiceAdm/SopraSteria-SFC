'use strict';

const columns = [
  'PayWorkplaces',
  'PayStaff',
  'TurnoverWorkplaces',
  'TurnoverStaff',
  'SicknessWorkplaces',
  'SicknessStaff',
  'QualificationsWorkplaces',
  'QualificationsStaff',
];

const benchmarksTable = {
  tableName: 'Benchmarks',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    const addComparisonColumns = (queryInterface, columnName, transaction) => {
      return queryInterface.addColumn(
        benchmarksTable,
        columnName,
        {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        { transaction },
      );
    };

    const createTable = (queryInterface, tableName, column, transaction) => {
      return queryInterface.createTable(
        tableName,
        {
          CssrID: {
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
        },
        {
          schema: 'cqc',
          transaction,
        },
      );
    };

    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        columns.map((column) => addComparisonColumns(queryInterface, column, t)),
        createTable(
          queryInterface,
          'BenchmarksPay',
          {
            Pay: {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: false,
            },
          },
          t,
        ),
        createTable(
          queryInterface,
          'BenchmarksSickness',
          {
            Sickness: {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: false,
            },
          },
          t,
        ),
        createTable(
          queryInterface,
          'BenchmarksTurnover',
          {
            Turnover: {
              type: Sequelize.DataTypes.DECIMAL(5, 2),
              allowNull: false,
            },
          },
          t,
        ),
        createTable(
          queryInterface,
          'BenchmarksQualifications',
          {
            Qualifications: {
              type: Sequelize.DataTypes.DECIMAL(3, 2),
              allowNull: false,
            },
          },
          t,
        ),
        queryInterface.createTable(
          'DataImports',
          {
            Type: {
              type: Sequelize.DataTypes.ENUM,
              allowNull: false,
              values: ['Benchmarks'],
            },
            Date: {
              type: Sequelize.DataTypes.DATE,
              allowNull: false,
            },
          },
          {
            schema: 'cqc',
            transaction: t,
          },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        columns.map((column) => queryInterface.removeColumn(benchmarksTable, column, { transaction })),
        queryInterface.dropTable({
          tableName: 'BenchmarksPay',
          schema: 'cqc',
        }),
        queryInterface.dropTable({
          tableName: 'BenchmarksSickness',
          schema: 'cqc',
        }),
        queryInterface.dropTable({
          tableName: 'BenchmarksTurnover',
          schema: 'cqc',
        }),
        queryInterface.dropTable({
          tableName: 'BenchmarksQualifications',
          schema: 'cqc',
        }),
      ]);
    });
  },
};
