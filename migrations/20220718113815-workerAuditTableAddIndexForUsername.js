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
