'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      Promise.all([
        queryInterface.addColumn(
          {
            tableName: 'Establishment',
            schema: 'cqc',
          },
          'IsRegulatedSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          {
            tableName: 'Establishment',
            schema: 'cqc',
          },
          'IsRegulatedChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          {
            tableName: 'Establishment',
            schema: 'cqc',
          },
          'IsRegulatedSavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          {
            tableName: 'Establishment',
            schema: 'cqc',
          },
          'IsRegulatedChangedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true
          },
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      Promise.all([
        queryInterface.removeColumn(
          {
            tableName: 'Establishment',
            schema: 'cqc'
          },
          'IsRegulatedSavedAt',
          {
            transaction: t
          }
        ),
        queryInterface.removeColumn(
          {
            tableName: 'Establishment',
            schema: 'cqc'
          },
          'IsRegulatedChangedAt',
          {
            transaction: t
          }
        ),
        queryInterface.removeColumn(
          {
            tableName: 'Establishment',
            schema: 'cqc'
          },
          'IsRegulatedSavedBy',
          {
            transaction: t
          }
        ),
        queryInterface.removeColumn(
          {
            tableName: 'Establishment',
            schema: 'cqc'
          },
          'IsRegulatedChangedBy',
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
