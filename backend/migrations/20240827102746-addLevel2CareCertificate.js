'use strict';

const table = { tableName: 'Worker', schema: 'cqc' };

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          table,
          'Level2CareCertificateValue',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'Level2CareCertificateYear',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'Level2CareCertificateSavedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'Level2CareCertificateChangedAt',
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'Level2CareCertificateSavedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
        queryInterface.addColumn(
          table,
          'Level2CareCertificateChangedBy',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        ),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn(table, 'Level2CareCertificateValue', { transaction }),
        queryInterface.removeColumn(table, 'Level2CareCertificateYear', { transaction }),
        queryInterface.removeColumn(table, 'Level2CareCertificateSavedAt', { transaction }),
        queryInterface.removeColumn(table, 'Level2CareCertificateChangedAt', { transaction }),
        queryInterface.removeColumn(table, 'Level2CareCertificateSavedBy', { transaction }),
        queryInterface.removeColumn(table, 'Level2CareCertificateChangedBy', { transaction }),
      ]);
    });
  },
};
