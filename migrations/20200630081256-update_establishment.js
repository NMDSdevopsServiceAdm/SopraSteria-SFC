'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      {
        tableName: 'Establishment',
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
        tableName: 'Establishment',
        schema: 'cqc'
      },
      'LaReportLockHeld',
    );
  }
};
