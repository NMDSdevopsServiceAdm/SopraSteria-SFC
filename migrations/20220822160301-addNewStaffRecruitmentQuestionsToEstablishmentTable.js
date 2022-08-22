'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'PeopleInterviewedInTheLastFourWeeks', {
          transaction,
        }),
        queryInterface.removeColumn(table, 'MoneySpentOnAdvertisingInTheLastFourWeeks', { transaction }),
        queryInterface.removeColumn(table, 'DoNewStartersRepeatMandatoryTrainingFromPreviousEmployment', {
          transaction,
        }),
        queryInterface.removeColumn(table, 'WouldYouAcceptCareCertificatesFromPreviousEmployment', { transaction }),
        queryInterface.sequelize.query(
          'DROP TYPE IF EXISTS cqc."enum_Establishment_WouldYouAcceptCareCertificatesFromPreviousEm";',
          {
            transaction,
          },
        ),
        queryInterface.sequelize.query(
          'DROP TYPE IF EXISTS cqc."enum_Establishment_DoNewStartersRepeatMandatoryTrainingFromPrev";',
          {
            transaction,
          },
        ),

        queryInterface.addColumn(
          table,
          'PeopleInterviewedInTheLastFourWeeks',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'MoneySpentOnAdvertisingInTheLastFourWeeks',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'DoNewStartersRepeatMandatoryTrainingFromPreviousEmployment',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes, always', 'Yes, very often', 'Yes, but not very often', 'No, never'],
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'WouldYouAcceptCareCertificatesFromPreviousEmployment',
          {
            type: Sequelize.DataTypes.ENUM,
            allowNull: true,
            values: ['Yes, always', 'Yes, very often', 'Yes, but not very often', 'No, never'],
          },
          { transaction },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'PeopleInterviewedInTheLastFourWeeks', { transaction }),
        queryInterface.removeColumn(table, 'MoneySpentOnAdvertisingInTheLastFourWeeks', { transaction }),
        queryInterface.removeColumn(table, 'DoNewStartersRepeatMandatoryTrainingFromPreviousEmployment', {
          transaction,
        }),
        queryInterface.removeColumn(table, 'WouldYouAcceptCareCertificatesFromPreviousEmployment', { transaction }),
      ]);
    });
  },
};
