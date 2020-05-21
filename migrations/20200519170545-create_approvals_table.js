'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Approvals', {
      ID: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      UUID: {
        type: Sequelize.DataTypes.UUID,
        unique: true,
        allowNull: false,
      },
      EstablishmentID: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'Establishment',
            schema: 'cqc'
          },
          key: 'EstablishmentID'
        },
        allowNull: false
      },
      UserID: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'User',
            schema: 'cqc'
          },
          key: 'RegistrationID'
        },
        allowNull: false
      },
      ApprovalType: Sequelize.DataTypes.ENUM(['BecomeAParent']),
      Status: Sequelize.DataTypes.ENUM(['Pending', 'Approved', 'Rejected']),
      RejectionReason: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      },
      Data: {
        type: Sequelize.DataTypes.JSON,
        allowNull: true,
      },
      createdAt: Sequelize.DataTypes.DATE,
      updatedAt: Sequelize.DataTypes.DATE,
    }, {
      schema: 'cqc'
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable({
      tableName: 'Approvals',
      schema: 'cqc',
    });
  }
}
