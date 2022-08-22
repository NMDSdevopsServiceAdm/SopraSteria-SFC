'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'RecruitmentJourneyExistingUserBanner', {
          transaction,
        }),

        queryInterface.addColumn(
          table,
          'RecruitmentJourneyExistingUserBanner',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          {
            transaction,
          },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn(table, 'RecruitmentJourneyExistingUserBanner');
  },
};
