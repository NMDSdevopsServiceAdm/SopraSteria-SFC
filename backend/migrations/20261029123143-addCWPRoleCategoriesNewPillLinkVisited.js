'use strict';

const establishmentTable = {
  tableName: 'Establishment',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(establishmentTable, 'CWPRoleCategoriesNewPillLinkVisited', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(establishmentTable, 'CWPRoleCategoriesNewPillLinkVisited');
  },
};
