'use strict';

const workerTable = { tableName: 'Establishment', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          workerTable,
          'UpdatePayForMultiStaffViewed',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          workerTable,
          'FastTrackPayByJobRolesViewed',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(workerTable, 'UpdatePayForMultiStaffViewed', { transaction }),
        queryInterface.removeColumn(workerTable, 'FastTrackPayByJobRolesViewed', { transaction }),
      ]);
    });
  },
};
