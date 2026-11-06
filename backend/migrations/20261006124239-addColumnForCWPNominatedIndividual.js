'use strict';

const workerTable = { tableName: 'Worker', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(workerTable, 'CWPRoleCategoryIsAlsoNominatedIndividual', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(workerTable, 'CWPRoleCategoryIsAlsoNominatedIndividual');
  },
};
