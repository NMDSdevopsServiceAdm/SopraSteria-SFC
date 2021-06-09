'use strict';

const table = {
  tableName: 'Worker',
  schema: 'cqc',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      try {
        await Promise.all(
          [
            queryInterface.addColumn(
              table,
              'WdfEligible',
              {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
              },
              { transaction },
            ),
            queryInterface.sequelize.query(`
            ALTER TABLE cqc."Worker"
            DROP COLUMN IF EXISTS "CurrentWdfEligibiity";
          `),
          ]
        )
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all(
        queryInterface.removeColumn(table, 'WdfEligible'),
    )
  }
};
