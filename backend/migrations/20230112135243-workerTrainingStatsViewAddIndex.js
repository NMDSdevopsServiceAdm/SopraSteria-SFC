'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS workertrainingstats_worker_category_idx ON cqc."WorkerTrainingStats" ("WorkerFK", "CategoryFK")',
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex(
      {
        tableName: 'WorkerTrainingStats',
        schema: 'cqc',
      },
      'cqc."workertrainingstats_worker_category_idx"',
    );
  },
};
