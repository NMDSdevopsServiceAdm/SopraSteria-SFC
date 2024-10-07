'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS cqc."WorkerQualificationStats"');
    await queryInterface.sequelize.query(
      `CREATE MATERIALIZED VIEW cqc."WorkerQualificationStats" AS (
        SELECT wt."WorkerFK",
        wt."QualificationsFK",
        wt."Year",
        count(*) AS total_quals
       FROM cqc."Worker" w
         JOIN cqc."WorkerQualifications" wt ON wt."WorkerFK" = w."ID"
      GROUP BY wt."WorkerFK", ROLLUP(wt."QualificationsFK", wt."Year")
      );`,
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS workerqualificationstats_worker_qualification_idx ON cqc."WorkerQualificationStats" ("WorkerFK", "QualificationsFK")',
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP MATERIALIZED VIEW IF EXISTS cqc."WorkerQualificationStats"');
    await queryInterface.sequelize.query(
      `CREATE MATERIALIZED VIEW cqc."WorkerQualificationStats" AS (
        SELECT wt."WorkerFK",
        wt."QualificationsFK",
        wt."Year",
        count(*) AS total_quals
       FROM cqc."Worker" w
         JOIN cqc."WorkerQualifications" wt ON wt."WorkerFK" = w."ID"
      WHERE w."Archived" = false
      GROUP BY wt."WorkerFK", ROLLUP(wt."QualificationsFK", wt."Year")
      );`,
    );
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS workerqualificationstats_worker_qualification_idx ON cqc."WorkerQualificationStats" ("WorkerFK", "QualificationsFK")',
    );
  },
};
