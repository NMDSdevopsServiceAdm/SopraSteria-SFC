'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'QualificationCertificates',
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
        WorkerQualificationsFK: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: 'WorkerQualifications',
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
        Key: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: false,
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
      tableName: 'QualificationCertificates',
      schema: 'cqc',
    });
  },
};
