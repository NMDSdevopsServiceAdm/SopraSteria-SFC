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
      'DeletedAt',
      {
        type: DataTypes.DATE,
        allowNull: true,
      }
    );
  },

  async down (queryInterface) {
    queryInterface.removeColumn(
      {
        tableName: 'Job',
        schema: 'cqc'
      },
      'DeletedAt'
    );
  }
};
