'use strict';

const changeColumns = async (queryInterface, Sequelize, table, allowNull, transaction) => {
  await Promise.all([
    queryInterface.changeColumn(
      table,
      'LocalAuthorityArea',
      {
        type: Sequelize.DataTypes.INTEGER,
        allowNull,
      },
      { transaction },
    ),
    queryInterface.changeColumn(
      table,
      'VacancyRate',
      {
        type: Sequelize.DataTypes.DECIMAL(5, 2),
        allowNull,
      },
      { transaction },
    ),
  ]);
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        changeColumns(
          queryInterface,
          Sequelize,
          { tableName: 'BenchmarksVacanciesByEstId', schema: 'cqc' },
          true,
          transaction,
        ),
        changeColumns(
          queryInterface,
          Sequelize,
          { tableName: 'BenchmarksVacanciesByEstIdGoodOutstanding', schema: 'cqc' },
          true,
          transaction,
        ),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        changeColumns(
          queryInterface,
          Sequelize,
          { tableName: 'BenchmarksVacanciesByEstId', schema: 'cqc' },
          false,
          transaction,
        ),
        changeColumns(
          queryInterface,
          Sequelize,
          { tableName: 'BenchmarksVacanciesByEstIdGoodOutstanding', schema: 'cqc' },
          false,
          transaction,
        ),
      ]);
    });
  },
};
