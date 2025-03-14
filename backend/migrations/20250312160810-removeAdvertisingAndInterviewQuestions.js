'use strict';

const establishmentTable = { tableName: 'Establishment', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(establishmentTable, 'MoneySpentOnAdvertisingInTheLastFourWeeks', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'PeopleInterviewedInTheLastFourWeeks', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'RecruitmentJourneyExistingUserBanner', { transaction }),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          establishmentTable,
          'MoneySpentOnAdvertisingInTheLastFourWeeks',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          establishmentTable,
          'PeopleInterviewedInTheLastFourWeeks',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          establishmentTable,
          'RecruitmentJourneyExistingUserBanner',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          { transaction },
        ),
      ]);
    });
  },
};
