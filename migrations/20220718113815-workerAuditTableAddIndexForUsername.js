'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query('DROP INDEX IF EXISTS cqc."worker_audit__username" ON cqc."WorkerAudit";', {
          transaction,
        }),
        queryInterface.addIndex(
          {
            tableName: 'WorkerAudit',
            schema: 'cqc',
          },
          {
            fields: ['Username'],
          },
        ),
      ]);
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex(
      {
        tableName: 'WorkerAudit',
        schema: 'cqc',
      },
      'cqc."worker_audit__username"',
    );
  },
};
