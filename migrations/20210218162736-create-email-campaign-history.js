'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'EmailCampaignHistories',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        emailCampaignID: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'EmailCampaigns',
              schema: 'cqc',
            },
            key: 'id',
          },
        },
        establishmentID: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Establishment',
              schema: 'cqc',
            },
            key: 'EstablishmentID',
          },
        },
        template: {
          type: Sequelize.STRING,
        },
        data: {
          type: Sequelize.JSONB,
        },
        sentToName: {
          type: Sequelize.STRING,
        },
        sentToEmail: {
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        schema: 'cqc',
      },
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable({
      schema: 'cqc',
      tableName: 'EmailCampaignHistories',
    });
  },
};
