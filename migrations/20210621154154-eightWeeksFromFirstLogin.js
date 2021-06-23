'use strict';

const moment = require('moment');

const table = {
  tableName: 'Establishment',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(table, 'eightWeeksFromFirstLogin', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    });

    queryInterface.sequelize.query(`UPDATE cqc."Establishment" SET "eightWeeksFromFirstLogin" = NOW();`);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(table, 'eightWeeksFromFirstLogin');
  },
};
