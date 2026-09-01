'use strict';

const workerTable = { tableName: 'Worker', schema: 'cqc' };

// This migration add a temporary copy of the old RegisteredNurseSavedAt and RegisteredNurseChangedAt columns to Worker table.
// This is to allow current analysis file script to run correctly, so that Nurse question feature branch can be deployed without Analysis file changes.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const copyDataToOldColumns = `
      UPDATE cqc."Worker"
      SET "RegisteredNurseSavedAt" = "NurseFieldOfPracticeSavedAt",
      "RegisteredNurseChangedAt" = "NurseFieldOfPracticeChangedAt";
    `;

    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          workerTable,
          'RegisteredNurseSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          workerTable,
          'RegisteredNurseChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
          },
          { transaction },
        ),
      ]);

      await queryInterface.sequelize.query(copyDataToOldColumns, { transaction });
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(workerTable, 'RegisteredNurseSavedAt', { transaction }),
        queryInterface.removeColumn(workerTable, 'RegisteredNurseChangedAt', { transaction }),
      ]);
    });
  },
};
