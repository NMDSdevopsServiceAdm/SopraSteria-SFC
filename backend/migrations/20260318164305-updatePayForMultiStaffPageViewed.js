'use strict';

const establishmentTable = { tableName: 'Establishment', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          establishmentTable,
          'UpdatePayForMultiStaffViewed',
          {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          establishmentTable,
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
        queryInterface.removeColumn(establishmentTable, 'UpdatePayForMultiStaffViewed', { transaction }),
        queryInterface.removeColumn(establishmentTable, 'FastTrackPayByJobRolesViewed', { transaction }),
      ]);
    });
  },
};
