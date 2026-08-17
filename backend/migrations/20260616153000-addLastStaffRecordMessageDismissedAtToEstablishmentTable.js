'use strict';

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(table, 'LastStaffRecordMessageDismissedAt', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn(table, 'LastStaffRecordMessageDismissedAt');
  },
};
