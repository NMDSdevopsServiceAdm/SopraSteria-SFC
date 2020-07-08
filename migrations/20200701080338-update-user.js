'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      {
        tableName: 'User',
        schema: 'cqc',
      },
      'LaReportLockHeld',
      {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      {
        tableName: 'User',
        schema: 'cqc'
      },
      'LaReportLockHeld',
      {
        tableName: 'User',
        schema: 'cqc',
      },
    );
  }
};
