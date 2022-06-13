'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(table, 'RecruitmentJourneyExistingUserBanner', {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn(table, 'RecruitmentJourneyExistingUserBanner');
  },
};
