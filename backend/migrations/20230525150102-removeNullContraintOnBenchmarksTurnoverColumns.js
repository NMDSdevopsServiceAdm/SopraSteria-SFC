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
      'TurnoverRate',
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
          { tableName: 'BenchmarksTurnoverByEstId', schema: 'cqc' },
          true,
          transaction,
        ),
        changeColumns(
          queryInterface,
          Sequelize,
          { tableName: 'BenchmarksTurnoverByEstIdGoodOutstanding', schema: 'cqc' },
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
          { tableName: 'BenchmarksTurnoverByEstId', schema: 'cqc' },
          false,
          transaction,
        ),
        changeColumns(
          queryInterface,
          Sequelize,
          { tableName: 'BenchmarksTurnoverByEstIdGoodOutstanding', schema: 'cqc' },
          false,
          transaction,
        ),
      ]);
    });
  },
};
