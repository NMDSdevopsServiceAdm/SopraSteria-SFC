"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const benchmarksTable = {
      tableName: "Benchmarks",
      schema: "cqc",
    };
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          benchmarksTable,
          "PayGoodCQC",
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          benchmarksTable,
          "PayLowTurnover",
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          benchmarksTable,
          "SicknessGoodCQC",
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          benchmarksTable,
          "SicknessLowTurnover",
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          benchmarksTable,
          "TurnoverGoodCQC",
          {
            type: Sequelize.DataTypes.DECIMAL(5, 2),
            allowNull: true,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          benchmarksTable,
          "TurnoverLowTurnover",
          {
            type: Sequelize.DataTypes.DECIMAL(5, 2),
            allowNull: true,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          benchmarksTable,
          "QualificationsGoodCQC",
          {
            type: Sequelize.DataTypes.DECIMAL(5, 2),
            allowNull: true,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          benchmarksTable,
          "QualificationsLowTurnover",
          {
            type: Sequelize.DataTypes.DECIMAL(5, 2),
            allowNull: true,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    const benchmarksTable = {
      tableName: "Benchmarks",
      schema: "cqc",
    };
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn(benchmarksTable, "PayGoodCQC", {
          transaction: t,
        }),
        queryInterface.removeColumn(benchmarksTable, "PayLowTurnover", {
          transaction: t,
        }),
        queryInterface.removeColumn(benchmarksTable, "SicknessGoodCQC", {
          transaction: t,
        }),
        queryInterface.removeColumn(benchmarksTable, "SicknessLowTurnover", {
          transaction: t,
        }),
        queryInterface.removeColumn(benchmarksTable, "TurnoverGoodCQC", {
          transaction: t,
        }),
        queryInterface.removeColumn(benchmarksTable, "TurnoverLowTurnover", {
          transaction: t,
        }),
        queryInterface.removeColumn(benchmarksTable, "QualificationsGoodCQC", {
          transaction: t,
        }),
        queryInterface.removeColumn(
          benchmarksTable,
          "QualificationsLowTurnover",
          { transaction: t }
        ),
      ]);
    });
  },
};
