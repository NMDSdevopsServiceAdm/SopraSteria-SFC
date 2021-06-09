'use strict';

const table = {
  tableName: 'Worker',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      table,
      'WdfEligible',
      {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
    );

    await queryInterface.sequelize.query(`
      ALTER TABLE cqc."Worker"
      DROP COLUMN IF EXISTS "CurrentWdfEligibiity";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn(table, 'WdfEligible');
  }
};
