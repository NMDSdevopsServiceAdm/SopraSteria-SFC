'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'CREATE INDEX IF NOT EXISTS workerjobstats_uniq_idx ON cqc."WorkerJobStats" ("EstablishmentID", "JobID")',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'CREATE INDEX IF NOT EXISTS workerjobstats_jobid_idx ON cqc."WorkerJobStats" ("JobID")',
          { transaction },
        ),
      ]);
    });
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.removeIndex(
          {
            tableName: 'WorkerJobStats',
            schema: 'cqc',
          },
          'cqc."workerjobstats_uniq_idx"',
          { transaction },
        ),
        queryInterface.removeIndex(
          {
            tableName: 'WorkerJobStats',
            schema: 'cqc',
          },
          'cqc."workerjobstats_jobid_idx"',
          { transaction },
        ),
      ]);
    });
  },
};
