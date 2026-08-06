'use strict';

const userTable = {
  tableName: 'User',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(userTable, 'ViewedUserResearchQuestion', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(userTable, 'ViewedUserResearchQuestion');
  },
};
