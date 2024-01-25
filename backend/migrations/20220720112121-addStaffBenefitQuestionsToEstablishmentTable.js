'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          table,
          'CareWorkersLeaveDaysPerYear',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'CareWorkersCashLoyaltyForFirstTwoYears',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'DoCareWorkersGetPaidMoreThanSickPayWhenTheyCannotWorkBecauseOfIllness',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No', "Don't know"],
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'DoCareWorkersGetMoreWorkplacePensionContributionThanTheMinimumThreePercent',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No', "Don't know"],
          },
          { transaction },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'CareWorkersLeaveDaysPerYear', { transaction }),
        queryInterface.removeColumn(table, 'CareWorkersCashLoyaltyForFirstTwoYears', { transaction }),
        queryInterface.removeColumn(table, 'DoCareWorkersGetPaidMoreThanSickPayWhenTheyCannotWorkBecauseOfIllness', {
          transaction,
        }),
        queryInterface.removeColumn(
          table,
          'DoCareWorkersGetMoreWorkplacePensionContributionThanTheMinimumThreePercent',
          { transaction },
        ),
      ]);
    });
  },
};
