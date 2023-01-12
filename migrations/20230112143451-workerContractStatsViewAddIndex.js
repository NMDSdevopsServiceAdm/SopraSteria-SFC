'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.sequelize.query(
          'CREATE INDEX IF NOT EXISTS workercontractstats_uniq_idx ON cqc."WorkerContractStats" ("EstablishmentFK", "MainJobFKValue")',
          { transaction },
        ),
        queryInterface.sequelize.query(
          'CREATE INDEX IF NOT EXISTS workercontractstats_mainjob_idx ON cqc."WorkerContractStats" ("MainJobFKValue")',
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
            tableName: 'WorkerContractStats',
            schema: 'cqc',
          },
          'cqc."workercontractstats_uniq_idx"',
          { transaction },
        ),
        queryInterface.removeIndex(
          {
            tableName: 'WorkerContractStats',
            schema: 'cqc',
          },
          'cqc."workercontractstats_mainjob_idx"',
          { transaction },
        ),
      ]);
    });
  },
};
