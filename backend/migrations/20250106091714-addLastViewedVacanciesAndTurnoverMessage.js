'use strict';

const userTable = { tableName: 'User', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(userTable, 'LastViewedVacanciesAndTurnoverMessage', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(userTable, 'LastViewedVacanciesAndTurnoverMessage');
  },
};
