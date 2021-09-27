'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Notes',
      {
        ID: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        UserFK: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'User',
              schema: 'cqc',
            },
            key: 'RegistrationID',
          },
        },
        EstablishmentFK: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Establishment',
              schema: 'cqc',
            },
            key: 'EstablishmentID',
          },
        },
        Note: {
          allowNull: false,
          type: Sequelize.TEXT,
        },
        NoteType: {
          allowNull: false,
          type: Sequelize.DataTypes.ENUM,
          values: ['Registration', 'Parent Request', 'Main Service'],
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        schema: 'cqc',
      },
    );
  },

  down: (queryInterface) => {
    return queryInterface.dropTable({
      schema: 'cqc',
      tableName: 'Notes',
    });
  },
};
