'use strict';

const establishmentTable = { tableName: 'Establishment', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(establishmentTable, 'MoneySpentOnAdvertisingInTheLastFourWeeks', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'PeopleInterviewedInTheLastFourWeeks', { transaction }),
      ]);
    });
  },

  down: async (queryInterface) => {
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
          table,
          'PeopleInterviewedInTheLastFourWeeks',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },
};
