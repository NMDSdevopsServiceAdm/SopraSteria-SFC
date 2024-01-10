'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS worker_audit__username ON cqc."WorkerAudit" ("Username");',
    );
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
