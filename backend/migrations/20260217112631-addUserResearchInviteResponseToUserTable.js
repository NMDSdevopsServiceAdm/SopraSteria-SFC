'use strict';

const userTable = { tableName: 'User', schema: 'cqc' };

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async(transaction) => {
      await Promise.all([
        queryInterface.addColumn(
          userTable,
          'UserResearchInviteResponseValue',
          {
            type: Sequelize.DataTypes.ENUM,
            values: ['Yes', 'No'],
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          userTable,
          'UserResearchInviteResponseSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          userTable,
          'UserResearchInviteResponseChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          userTable,
          'UserResearchInviteResponseSavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          userTable,
          'UserResearchInviteResponseChangedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },

  async down (queryInterface) {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(userTable, 'UserResearchInviteResponseValue', { transaction }),
        queryInterface.removeColumn(userTable, 'UserResearchInviteResponseSavedAt', { transaction }),
        queryInterface.removeColumn(userTable, 'UserResearchInviteResponseChangedAt', { transaction }),
        queryInterface.removeColumn(userTable, 'UserResearchInviteResponseSavedBy', { transaction }),
        queryInterface.removeColumn(userTable, 'UserResearchInviteResponseChangedBy', { transaction }),
      ]);
    });
  },
};
