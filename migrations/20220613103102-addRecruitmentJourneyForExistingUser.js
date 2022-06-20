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
        allowNull: false,
        defaultValue: false,
      }),
    ]);
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn(table, 'RecruitmentJourneyExistingUserBanner');
  },
};
