'use strict';
const { DataTypes } = require('sequelize');
const models = require('../server/models/index');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    queryInterface.addColumn(
      {
        tableName: 'Job',
        schema: 'cqc',
      },
      'IsDeleted',
      {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }
    );
  },

  async down (queryInterface) {
    queryInterface.removeColumn(
      {
        tableName: 'Job',
        schema: 'cqc'
      },
      'IsDeleted'
    );
  }
};
