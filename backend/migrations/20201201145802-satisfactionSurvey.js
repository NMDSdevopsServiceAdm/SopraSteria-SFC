'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('SatisfactionSurvey', {
        ID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        EstablishmentFK: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Establishment',
              schema: 'cqc'
            },
            key: 'EstablishmentID'
          }
        },
        DidYouDoEverything: {
          type: Sequelize.DataTypes.ENUM,
          allowNull: true,
          values: ['Yes', 'Some', 'No']
        },
        DidYouDoEverythingAdditionalAnswer: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        HowDidYouFeel: {
          type: Sequelize.DataTypes.ENUM,
          allowNull: true,
          values: ['Very satisfied', 'Satisfied', 'Neither', 'Dissatisfied', 'Very dissatisfied']
        },
        SubmittedDate: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
        },
      }, { schema: 'cqc' }),
      queryInterface.sequelize.query(`ALTER TYPE cqc."UserAuditChangeType" ADD VALUE IF NOT EXISTS 'logout';`)
    ])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable({
      tableName: 'SatisfactionSurvey',
      schema: 'cqc',
    })
  }
};
