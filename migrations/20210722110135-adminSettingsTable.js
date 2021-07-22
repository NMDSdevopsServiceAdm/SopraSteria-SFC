'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      await queryInterface.createTable(
        'AdminSettings',
        {
          ID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          Name: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          Value: {
            type: Sequelize.JSONB,
            allowNull: false,
          },
        },
        { schema: 'cqc' },
      ),
      await queryInterface.sequelize.query(`INSERT INTO cqc."AdminSettings" ("Name", "Value") VALUES
        ('laReturnStartDate', '{"type": "string", "value": "2021-09-13"}'),
        ('laReturnEndDate', '{"type": "string", "value": "2021-10-31"}')
      ;`),
    ]);
  },

  down: (queryInterface) => {
    return queryInterface.dropTable({
      tableName: 'AdminSettings',
      schema: 'cqc',
    });
  },
};
