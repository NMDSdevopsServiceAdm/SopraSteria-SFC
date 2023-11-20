'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn(
      {
        tableName: 'Establishment',
        schema: 'cqc',
      },
      'CssrID',
      {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
    );
  },

  async down(queryInterface) {
    queryInterface.removeColumn(
      {
        tableName: 'Establishment',
        schema: 'cqc',
      },
      'CssrID',
    );
  },
};
