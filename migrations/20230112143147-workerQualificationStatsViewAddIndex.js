'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS workerqualificationstats_worker_qualification_idx ON cqc."WorkerQualificationStats" ("WorkerFK", "QualificationsFK")',
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex(
      {
        tableName: 'WorkerQualificationStats',
        schema: 'cqc',
      },
      'cqc."workerqualificationstats_worker_qualification_idx"',
    );
  },
};
