'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS cqc."WorkerContractStats"');
    await queryInterface.sequelize.query(
      `CREATE MATERIALIZED VIEW cqc."WorkerContractStats" AS (
        SELECT "Worker"."EstablishmentFK",
        "Worker"."MainJobFKValue",
        count(*) AS total_staff,
        count(*) FILTER (WHERE "Worker"."ContractValue" = 'Permanent'::cqc."WorkerContract") AS total_perm_staff,
        count(*) FILTER (WHERE "Worker"."ContractValue" = 'Temporary'::cqc."WorkerContract") AS total_temp_staff,
        count(*) FILTER (WHERE "Worker"."ContractValue" = 'Pool/Bank'::cqc."WorkerContract") AS total_pool_bank,
        count(*) FILTER (WHERE "Worker"."ContractValue" = 'Agency'::cqc."WorkerContract") AS total_agency,
        count(*) FILTER (WHERE "Worker"."ContractValue" = 'Other'::cqc."WorkerContract") AS total_other,
        count(*) FILTER (WHERE "Worker"."ContractValue" = ANY (ARRAY['Permanent'::cqc."WorkerContract", 'Temporary'::cqc."WorkerContract"])) AS total_employed
       FROM cqc."Worker"
      WHERE "Worker"."Archived" = false
      GROUP BY "Worker"."EstablishmentFK", ROLLUP("Worker"."MainJobFKValue")
      );`,
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP MATERIALIZED VIEW "cqc"."WorkerContractStats"');
  },
};
