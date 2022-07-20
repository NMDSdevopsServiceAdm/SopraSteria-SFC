'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex(
      {
        tableName: 'WorkerAudit',
        schema: 'cqc',
      },
      {
        fields: ['Username'],
      },
      {
        name: 'worker_audit__username_idx',
      },
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex(
      {
        tableName: 'WorkerAudit',
        schema: 'cqc',
      },
      'cqc."worker_audit__username_idx"',
    );
  },
};
