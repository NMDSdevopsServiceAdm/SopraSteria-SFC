'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'DevelopmentFundGrants',
      {
        AgreementID: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
        },
        EstablishmentID: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Establishment',
              schema: 'cqc',
            },
            key: 'EstablishmentID',
          },
          unique: true,
        },
        SignStatus: {
          type: Sequelize.ENUM,
          allowNull: false,
          default: 'SENT',
          values: ['SENT', 'COMPLETED', 'CANCELLED'],
        },
        ReceiverName: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        ReceiverEmail: {
          type: Sequelize.STRING(320),
          allowNull: false,
        },
        DateSent: {
          type: Sequelize.DATE,
          allowNull: false,
          default: Sequelize.NOW,
        },
        DateCompleted: {
          type: Sequelize.DATE,
          allowNull: true,
          default: null,
        },
      },
      {
        schema: 'cqc',
      },
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable({
      tableName: 'DevelopmentFundGrants',
      schema: 'cqc',
    });
  },
};
