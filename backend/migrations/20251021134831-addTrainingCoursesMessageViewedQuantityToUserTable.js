'use strict';

const userTable = { tableName: 'User', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(userTable, 'TrainingCoursesMessageViewedQuantity', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(userTable, 'TrainingCoursesMessageViewedQuantity');
  },
};
