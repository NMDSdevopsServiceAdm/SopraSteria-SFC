'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'TrainingCourse',
      {
        ID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        UID: {
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.DataTypes.UUIDV4,
          allowNull: false,
          unique: true,
        },
        EstablishmentFK: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: 'Establishment',
              schema: 'cqc',
            },
            key: 'EstablishmentID',
          },
        },
        CategoryFK: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: 'TrainingCategories',
              schema: 'cqc',
            },
            key: 'ID',
          },
        },
        Name: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        Accredited: {
          type: 'cqc."WorkerTrainingAccreditation"',
          allowNull: true,
        },
        DeliveredBy: {
          type: 'cqc."WorkerTrainingDeliveredBy"',
          allowNull: true,
        },
        ExternalProviderName: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        HowWasItDelivered: {
          type: 'cqc."WorkerTrainingDeliveryMode"',
          allowNull: true,
        },
        DoesNotExpire: {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
        },
        ValidityPeriodInMonth: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true,
        },
        created: {
          type: Sequelize.DataTypes.DATE,
        },
        updated: {
          type: Sequelize.DataTypes.DATE,
        },
        createdBy: {
          type: Sequelize.DataTypes.TEXT,
        },
        updatedBy: {
          type: Sequelize.DataTypes.TEXT,
        },
        archived: {
          type: Sequelize.DataTypes.BOOLEAN,
        },
      },
      { schema: 'cqc' },
    );
  },

  async down(queryInterface) {
    return queryInterface.dropTable({
      tableName: 'TrainingCourse',
      schema: 'cqc',
    });
  },
};
