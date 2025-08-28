'use strict';

const jobsTable = {
  tableName: 'Job',
  schema: 'cqc',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(jobsTable, 'CanDoDelegatedHealthcareActivities', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn(jobsTable, 'CanDoDelegatedHealthcareActivities');
  },
};
