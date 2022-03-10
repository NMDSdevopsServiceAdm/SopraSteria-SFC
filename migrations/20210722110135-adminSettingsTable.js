'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
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
            Data: {
              type: Sequelize.JSONB,
              allowNull: false,
            },
          },
          { schema: 'cqc', transaction },
        ),
        await queryInterface.sequelize.query(
          `INSERT INTO cqc."AdminSettings" ("Name", "Data") VALUES
          ('laReturnStartDate', '{"type": "string", "value": "2021-09-13"}'),
          ('laReturnEndDate', '{"type": "string", "value": "2021-10-31"}');`,
          { transaction },
        ),
      ]);
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable({
      tableName: 'AdminSettings',
      schema: 'cqc',
    });
  },
};
