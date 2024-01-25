'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('EmailCampaigns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userID: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'User',
            schema: 'cqc'
          },
          key: 'RegistrationID'
        },
      },
      type: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },
    {
      schema: 'cqc'
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable({
      schema: 'cqc',
      tableName: 'EmailCampaigns'
    });
  }
};
