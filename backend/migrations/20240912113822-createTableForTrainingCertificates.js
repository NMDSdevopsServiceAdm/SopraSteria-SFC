'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'TrainingCertificates',
      {
        ID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        UID: {
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.literal('uuid_generate_v4()'),
          allowNull: false,
          unique: true,
        },
        WorkerTrainingFK: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: 'WorkerTraining',
              schema: 'cqc',
            },
            key: 'ID',
          },
        },
        WorkerFK: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: 'Worker',
              schema: 'cqc',
            },
            key: 'ID',
          },
        },
        FileName: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: false,
        },
        UploadDate: {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
        },
      },
      { schema: 'cqc' },
    );
  },

  async down(queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.dropTable({
      tableName: 'TrainingCertificates',
      schema: 'cqc',
    });
  },
};
