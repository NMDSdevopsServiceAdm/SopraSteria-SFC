'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'DoCareWorkersGetPaidMoreThanSickPayWhenTheyCannotWorkBecauseOfIllness', {
          transaction,
        }),
        queryInterface.removeColumn(
          table,
          'DoCareWorkersGetMoreWorkplacePensionContributionThanTheMinimumThreePercent',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'DROP TYPE IF EXISTS cqc."enum_Establishment_DoCareWorkersGetMoreWorkplacePensionContributionThanTheMinimumT";',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'DROP TYPE IF EXISTS cqc."enum_Establishment_DoCareWorkersGetPaidMoreThanSickPayWhenTheyCannotWorkBecauseOfI";',
          {
            transaction,
          },
        ),

        queryInterface.addColumn(
          table,
          'SickPay',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes', 'No', "Don't know"],
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'PensionContribution',
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
};
