'use strict';

const establishmentTable = {
  tableName: 'Establishment',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(establishmentTable, 'CWPAwarenessQuestionViewed', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(establishmentTable, 'CWPAwarenessQuestionViewed');
  },
};
