'use strict';

const changeColumns = async (queryInterface, Sequelize, table, allowNull, transaction) => {
  await Promise.all([
    queryInterface.changeColumn(
      table,
      'AverageAnnualFTE',
      {
        type: Sequelize.DataTypes.INTEGER,
        allowNull,
      },
      { transaction },
    ),
    queryInterface.changeColumn(
      table,
      'AverageHourlyRate',
      {
        type: Sequelize.DataTypes.INTEGER,
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
          { tableName: 'BenchmarksPayByEstId', schema: 'cqc' },
          true,
          transaction,
        ),
        changeColumns(
          queryInterface,
          Sequelize,
          { tableName: 'BenchmarksPayByEstIdGoodOutstanding', schema: 'cqc' },
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
          { tableName: 'BenchmarksPayByEstId', schema: 'cqc' },
          false,
          transaction,
        ),
        changeColumns(
          queryInterface,
          Sequelize,
          { tableName: 'BenchmarksPayByEstIdGoodOutstanding', schema: 'cqc' },
          false,
          transaction,
        ),
      ]);
    });
  },
};

// const benchmarksTable = { tableName: 'BenchmarksPayByEstId', schema: 'cqc' };
// const benchmarks2Table = { tableName: 'BenchmarksPayByEstIdGoodOutstanding', schema: 'cqc' };

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.sequelize.transaction(async (transaction) => {
//       await Promise.all([
//         queryInterface.changeColumn(
//           benchmarksTable,
//           'AverageAnnualFTE',
//           {
//             type: Sequelize.DataTypes.INTEGER,
//             allowNull: true,
//           },
//           { transaction },
//         ),
//         queryInterface.changeColumn(
//           benchmarksTable,
//           'AverageHourlyRate',
//           {
//             type: Sequelize.DataTypes.INTEGER,
//             allowNull: true,
//           },
//           { transaction },
//         ),
//         queryInterface.changeColumn(
//           benchmarks2Table,
//           'AverageAnnualFTE',
//           {
//             type: Sequelize.DataTypes.INTEGER,
//             allowNull: true,
//           },
//           { transaction },
//         ),
//         queryInterface.changeColumn(
//           benchmarks2Table,
//           'AverageHourlyRate',
//           {
//             type: Sequelize.DataTypes.INTEGER,
//             allowNull: true,
//           },
//           { transaction },
//         ),
//       ]);
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.sequelize.transaction(async (transaction) => {
//       await Promise.all([
//         queryInterface.changeColumn(
//           benchmarksTable,
//           'AverageAnnualFTE',
//           {
//             type: Sequelize.DataTypes.INTEGER,
//             allowNull: false,
//           },
//           { transaction },
//         ),
//         queryInterface.changeColumn(
//           benchmarksTable,
//           'AverageHourlyRate',
//           {
//             type: Sequelize.DataTypes.INTEGER,
//             allowNull: false,
//           },
//           { transaction },
//         ),
//         queryInterface.changeColumn(
//           benchmarks2Table,
//           'AverageAnnualFTE',
//           {
//             type: Sequelize.DataTypes.INTEGER,
//             allowNull: false,
//           },
//           { transaction },
//         ),
//         queryInterface.changeColumn(
//           benchmarks2Table,
//           'AverageHourlyRate',
//           {
//             type: Sequelize.DataTypes.INTEGER,
//             allowNull: false,
//           },
//           { transaction },
//         ),
//       ]);
//     });
//   },
// };
